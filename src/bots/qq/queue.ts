import { Telegraf } from 'telegraf'
import { User } from 'telegraf/typings/core/types/typegram'

import { delay, getName, getProfilePhoto } from '@/utils'
import { QQ_MSG_TO_TG_PREFIX, TG_MSG_TO_QQ_PREFIX } from '@/utils/consts'
import * as redis from '@/utils/redis'

import * as qq from './utils'

type Profile = {
  fromUser: User
}

type TelegramMsgId = {
  telegramMsgId?: number
}

type ImageData = {
  groupId?: string
  image: string
  caption?: string
  msgId: number
}

type MsgData =
  | {
      type: 'text'
      data: string
    }
  | {
      type: 'video'
      data: {
        video: string
        caption?: string
      }
    }
  | {
      type: 'image'
      data: ImageData
    }
  | {
      type: 'image_group'
      data: {
        groupId: string
      }
    }

type Message = TelegramMsgId & Profile & MsgData

export class QQMsgQueue {
  private bot: Telegraf
  private queue: Message[] = []
  private imageGroup: { [key: string]: ImageData[] } = {}

  constructor(bot: Telegraf) {
    this.bot = bot
  }

  public start() {
    const send = async () => {
      try {
        await this.sendMessage()
      } catch (err) {
        console.error(err)
      }
      await delay(100)
      send()
    }
    send()
  }

  public addMessage(msg: Message) {
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

  static canSendSingleMessage = (sender: User, msg: Message | undefined) => {
    if (!msg || msg.fromUser.id !== sender.id) {
      return false
    }
    if (!['image', 'image_group', 'text'].includes(msg.type)) {
      return false
    }
    return true
  }

  private async sendMessage() {
    const msg = this.queue.shift()
    if (!msg) return

    const profilePhoto = await getProfilePhoto(this.bot, msg.fromUser.id)
    const username = getName(msg.fromUser)

    if (msg.type === 'video') {
      const { message_id: msgId1 } = await qq.sendMessage(
        `[CQ:video,file=${msg.data.video},c=3]`,
      )
      const { message_id: msgId2 } = await qq.sendMessage(
        `[CQ:image,file=${profilePhoto}]${username} 上传了视频` +
          (msg.data.caption ? `\n${msg.data.caption}` : ''),
      )
      if (msg.telegramMsgId) {
        await redis.setex(
          `${TG_MSG_TO_QQ_PREFIX}${msg.telegramMsgId}`,
          24 * 60 * 60,
          `${msgId1},${msgId2}`,
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
