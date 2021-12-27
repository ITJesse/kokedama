import { Context, Telegraf } from 'telegraf'
import { Update, User } from 'telegraf/typings/core/types/typegram'

import { delay, getName, getProfilePhoto } from '@/utils'
import { QQ_MSG_TO_TG_PREFIX, TG_MSG_TO_QQ_PREFIX } from '@/utils/consts'
import * as redis from '@/utils/redis'

import * as qq from '../utils'
import { MsgQueue } from './base'
import { TelegramImageData, TelegramMessage } from './types'

export class TelegramMsgQueue extends MsgQueue<TelegramMessage> {
  private imageGroup: { [key: string]: TelegramImageData[] } = {}

  public addMessage(msg: TelegramMessage) {
    if (msg.type === 'image' && msg.data.groupId) {
      const { groupId } = msg.data
      if (!this.imageGroup[groupId]) {
        this.imageGroup[groupId] = []
      }
      this.imageGroup[groupId].push(msg.data)
      const exists = this.queue.find(
        (e) => e.type === 'image_group' && e.data.groupId === groupId,
      )
      if (!exists) {
        this.queue.push({
          type: 'image_group',
          data: { groupId: groupId },
          fromUser: msg.fromUser,
        })
      }
    } else {
      this.queue.push(msg)
    }
  }

  static extractTelegramInfo = (msg: Context<Update>) => {
    const { message } = msg
    if (!message) throw new Error('message type not match')

    return {
      telegramMsgId: message.message_id,
      replyToMsgId: (message as any).reply_to_message?.message_id as
        | number
        | undefined,
      fromUser: message.from,
    }
  }

  protected async sendMessage() {
    const msg = this.queue.shift()
    if (!msg) return

    const profilePhoto = await getProfilePhoto(this.bot, msg.fromUser.id)
    const username = getName(msg.fromUser)

    if (msg.type === 'video') {
      await qq.sendMessage(`[CQ:video,file=${msg.data.video},c=3]`)
      const { message_id } = await qq.sendMessage(
        `[CQ:image,file=${profilePhoto}]${username} 上传了视频` +
          (msg.data.caption ? `\n${msg.data.caption}` : ''),
      )
      if (msg.telegramMsgId) {
        await redis.setex(
          `${TG_MSG_TO_QQ_PREFIX}${msg.telegramMsgId}`,
          24 * 60 * 60,
          `${message_id}`,
        )
      }
    } else {
      let content = `[CQ:image,file=${profilePhoto}]${username} 说：`
      if (msg.type === 'text') {
        content += `\n${msg.data}`
      }
      if (msg.type === 'image') {
        content +=
          `\n[CQ:image,file=${msg.data.image}]` +
          (msg.data.caption ? `\n${msg.data.caption}` : '')
      }
      if (msg.type === 'image_group') {
        const images = (this.imageGroup[msg.data.groupId] ?? []).sort(
          (a, b) => a.msgId - b.msgId,
        )
        for (const image of images) {
          content +=
            `\n[CQ:image,file=${image.image}]` +
            (image.caption ? `\n${image.caption}` : '')
        }
      }
      const qqMsgId = msg.replyToMsgId
        ? await redis.get(`${TG_MSG_TO_QQ_PREFIX}${msg.replyToMsgId}`)
        : undefined
      if (qqMsgId) {
        content = `[CQ:reply,id=${qqMsgId}] ${content}`
      }
      const { message_id } = await qq.sendMessage(content)
      if (msg.telegramMsgId) {
        await redis.setex(
          `${TG_MSG_TO_QQ_PREFIX}${msg.telegramMsgId}`,
          24 * 60 * 60,
          `${message_id}`,
        )
      }
    }
  }
}
