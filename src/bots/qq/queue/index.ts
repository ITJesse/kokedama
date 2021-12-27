import axios from 'axios'
import { Context, Markup, Telegraf } from 'telegraf'
import { InputFile, Update, User } from 'telegraf/typings/core/types/typegram'

import { delay, getName, getProfilePhoto } from '@/utils'
import { QQ_MSG_TO_TG_PREFIX, TG_MSG_TO_QQ_PREFIX } from '@/utils/consts'
import { signUrl } from '@/utils/oss'
import * as redis from '@/utils/redis'

import * as qq from '../qq'
import * as utils from '../utils'
import { MsgQueue } from './base'
import { QQMessage, QQMsgId, QQProfile, TelegramImageData, TelegramMessage } from './types'

export class QQMsgQueue extends MsgQueue<TelegramMessage> {
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

  protected async sendMessage(msg: TelegramMessage) {
    const profilePhoto = await getProfilePhoto(this.bot, msg.fromUser.id)
    const username = getName(msg.fromUser)

    let qqMsgId: number | null = null
    if (msg.type === 'video') {
      await qq.sendMessage(`[CQ:video,file=${msg.data.video},c=3]`)
      const { message_id } = await qq.sendMessage(
        `[CQ:image,file=${profilePhoto}]${username} 上传了视频` +
          (msg.data.caption ? `\n${msg.data.caption}` : ''),
      )
      qqMsgId = message_id
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
      const replyToMsgId = msg.replyToMsgId
        ? await redis.get(`${TG_MSG_TO_QQ_PREFIX}${msg.replyToMsgId}`)
        : undefined
      if (replyToMsgId) {
        content = `[CQ:reply,id=${replyToMsgId}] ${content}`
      }
      const { message_id } = await qq.sendMessage(content)
      qqMsgId = message_id
    }

    if (msg.telegramMsgId && qqMsgId) {
      await redis.setex(
        `${TG_MSG_TO_QQ_PREFIX}${msg.telegramMsgId}`,
        24 * 60 * 60,
        `${qqMsgId}`,
      )
      await redis.setex(
        `${QQ_MSG_TO_TG_PREFIX}${qqMsgId}`,
        24 * 60 * 60,
        `${msg.telegramMsgId}`,
      )
    }
  }
}

export class TelegramMsgQueue extends MsgQueue<QQMessage> {
  public addMessage(msg: QQMessage) {
    this.queue.push(msg)
  }

  static extractQQInfo = async (msg: any): Promise<QQProfile & QQMsgId> => {
    console.log(msg)
    if (msg.message_type === 'group' && msg.post_type === 'message') {
      const reply = msg.message.find((e: any) => e.type === 'reply')
      return Promise.resolve({
        qqMsgId: msg.message_id,
        replyToMsgId: reply?.data.id,
        title: msg.sender.title,
        nickname: msg.sender.nickname,
      })
    }
    if (msg.post_type === 'notice') {
      const { nickname, title } = await qq.getGroupMemberInfo(msg.user_id)
      return Promise.resolve({
        qqMsgId: msg.message_id,
        title,
        nickname,
      })
    }
    throw new Error('message type not match')
  }

  protected async sendMessage(msg: QQMessage) {
    const { title, nickname } = msg
    const username = `${title ? `[${title}]` : ''} ${nickname}`

    const replyMsgIdStr = msg.replyToMsgId
      ? await redis.get(`${QQ_MSG_TO_TG_PREFIX}${msg.replyToMsgId}`)
      : undefined
    const replyMsgId = replyMsgIdStr ? parseInt(replyMsgIdStr) : undefined

    let telegramMsgId: number | null = null
    if (msg.type === 'video') {
      const { message_id } = await this.bot.telegram.sendVideo(
        process.env.TELEGRAM_GROUP_ID ?? 0,
        signUrl('/sample/upload.mp4'),
        {
          caption: `<b>${username}</b> 正在发送视频...`,
          parse_mode: 'HTML',
          reply_markup: Markup.inlineKeyboard([
            [Markup.button.callback(`来自QQ的消息`, 'nop')],
          ]).reply_markup,
          reply_to_message_id: replyMsgId,
          allow_sending_without_reply: true,
        },
      )
      telegramMsgId = message_id
      const { data } = await axios.get(msg.data.video, {
        responseType: 'arraybuffer',
      })
      const { width, height } = await utils.getVideoDimensions(
        Buffer.from(data),
      )
      await this.bot.telegram.editMessageMedia(
        process.env.TELEGRAM_GROUP_ID ?? 0,
        message_id,
        undefined,
        {
          type: 'video',
          media: {
            source: Buffer.from(data),
          },
          width,
          height,
          caption: `<b>${username}</b>`,
          parse_mode: 'HTML',
        },
        {
          reply_markup: Markup.inlineKeyboard([
            [Markup.button.callback(`来自QQ的消息`, 'nop')],
          ]).reply_markup,
        },
      )
    }

    if (msg.type === 'animation') {
      const { message_id } = await this.bot.telegram.sendAnimation(
        process.env.TELEGRAM_GROUP_ID ?? 0,
        msg.data.video,
        {
          caption: `<b>${username}</b>`,
          parse_mode: 'HTML',
          reply_markup: Markup.inlineKeyboard([
            [Markup.button.callback(`来自QQ的消息`, 'nop')],
          ]).reply_markup,
          reply_to_message_id: replyMsgId,
          allow_sending_without_reply: true,
        },
      )
      telegramMsgId = message_id
    }

    if (msg.type === 'text') {
      const message = `<b>${username} 说：</b>\n${msg.data}`
      const { message_id } = await this.bot.telegram.sendMessage(
        process.env.TELEGRAM_GROUP_ID ?? 0,
        message,
        {
          parse_mode: 'HTML',
          reply_markup: Markup.inlineKeyboard([
            [Markup.button.callback(`来自QQ的消息`, 'nop')],
          ]).reply_markup,
          reply_to_message_id: replyMsgId,
          allow_sending_without_reply: true,
        },
      )
      telegramMsgId = message_id
    }

    if (msg.type === 'image') {
      let media: InputFile = {
        url: msg.data.image,
      }
      if (msg.data.image.startsWith('http://')) {
        const { data } = await axios.get(msg.data.image, {
          responseType: 'arraybuffer',
        })
        media = {
          source: Buffer.from(data),
        }
      }
      const { message_id } = await this.bot.telegram.sendPhoto(
        process.env.TELEGRAM_GROUP_ID ?? 0,
        media,
        {
          caption: `<b>${username}</b>`,
          parse_mode: 'HTML',
          reply_markup: Markup.inlineKeyboard([
            [Markup.button.callback(`来自QQ的消息`, 'nop')],
          ]).reply_markup,
          reply_to_message_id: replyMsgId,
          allow_sending_without_reply: true,
        },
      )
      telegramMsgId = message_id
    }

    if (msg.type === 'recall') {
      const msgId = await redis.get(`${QQ_MSG_TO_TG_PREFIX}${msg.data.msgId}`)
      if (msgId) {
        await this.bot.telegram.deleteMessage(
          process.env.TELEGRAM_GROUP_ID ?? 0,
          parseInt(msgId),
        )
      }
    }

    if (telegramMsgId && msg.qqMsgId) {
      await redis.setex(
        `${TG_MSG_TO_QQ_PREFIX}${telegramMsgId}`,
        24 * 60 * 60,
        `${msg.qqMsgId}`,
      )
      await redis.setex(
        `${QQ_MSG_TO_TG_PREFIX}${msg.qqMsgId}`,
        24 * 60 * 60,
        `${telegramMsgId}`,
      )
    }
  }
}
