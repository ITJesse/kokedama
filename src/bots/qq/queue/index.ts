import axios from 'axios'
import { commandOptions } from 'redis'
import { Context, Markup, Telegraf } from 'telegraf'
import { InputFile, Update, User } from 'telegraf/typings/core/types/typegram'
import { threadId } from 'worker_threads'

import { delay, getName, getProfilePhoto } from '@/utils'
import {
    MEDIA_GROUP_PREFIX, QQ_MSG_TO_TG_PREFIX, QQMSG_QUEUE, TG_MSG_TO_QQ_PREFIX, TGMSG_QUEUE
} from '@/utils/consts'
import { signUrl } from '@/utils/oss'
import redis from '@/utils/redis'

import * as qq from '../qq'
import * as utils from '../utils'
import { MsgQueue } from './base'
import { QQMessage, QQMsgId, QQProfile, TelegramImageData, TelegramMessage } from './types'

export class QQMsgQueue extends MsgQueue<TelegramMessage> {
  protected queue = QQMSG_QUEUE

  public async addMessage(msg: TelegramMessage) {
    if (msg.type === 'image' && msg.data.groupId) {
      const { groupId } = msg.data
      await this.client.RPUSH(
        `${MEDIA_GROUP_PREFIX}${groupId}`,
        JSON.stringify(msg.data),
      )
      await this.client.RPUSH(
        this.queue,
        JSON.stringify({
          type: 'image_group',
          data: { groupId: groupId },
          fromUser: msg.fromUser,
        }),
      )
    } else {
      await this.client.RPUSH(this.queue, JSON.stringify(msg))
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

    const replyToMsgId = msg.replyToMsgId
      ? await this.client.get(`${TG_MSG_TO_QQ_PREFIX}${msg.replyToMsgId}`)
      : undefined

    let qqMsgId: number | null = null
    if (msg.type === 'video') {
      await qq.sendMessage(`[CQ:video,file=${msg.data.video},c=3]`)
      const { message_id } = await qq.sendMessage(
        `[CQ:image,file=${profilePhoto}]${username} 上传了视频` +
          (msg.data.caption ? `\n${msg.data.caption}` : ''),
      )
      qqMsgId = message_id
    } else if (msg.type === 'image_group') {
      let content = `[CQ:image,file=${profilePhoto}]${username} 说：`
      let images: TelegramImageData[] = []
      const getImages = async () => {
        const res = await this.client.BLPOP(
          commandOptions({ isolated: true }),
          `${MEDIA_GROUP_PREFIX}${msg.data.groupId}`,
          3,
        )
        await this.client.DEL(`${MEDIA_GROUP_PREFIX}${msg.data.groupId}`)
        if (res?.element) {
          const r: TelegramImageData = JSON.parse(res.element)
          images.push(r)
          await getImages()
        } else {
          return
        }
      }
      await getImages()
      if (images.length === 0) {
        return
      }
      images = images.sort((a, b) => a.msgId - b.msgId)
      const tgIds: number[] = []
      for (const image of images) {
        content += `\n[CQ:image,file=${image.image}]`
        tgIds.push(image.msgId)
      }
      const { message_id } = await qq.sendMessage(content)
      for (const tgId of tgIds) {
        await this.client.SETEX(
          `${TG_MSG_TO_QQ_PREFIX}${tgId}`,
          24 * 60 * 60,
          `${message_id}`,
        )
      }
      await this.client.SETEX(
        `${QQ_MSG_TO_TG_PREFIX}${message_id}`,
        24 * 60 * 60,
        `${tgIds.join(',')}`,
      )
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
      // if (replyToMsgId) {
      //   content = `[CQ:reply,id=${replyToMsgId}] ${content}`
      // }
      const resp = await qq.sendMessage(content)
      qqMsgId = resp?.message_id
    }

    if (msg.telegramMsgId && qqMsgId) {
      await this.client.SETEX(
        `${TG_MSG_TO_QQ_PREFIX}${msg.telegramMsgId}`,
        24 * 60 * 60,
        `${qqMsgId}`,
      )
      await this.client.SETEX(
        `${QQ_MSG_TO_TG_PREFIX}${qqMsgId}`,
        24 * 60 * 60,
        `${msg.telegramMsgId}`,
      )
    }
  }
}

export class TelegramMsgQueue extends MsgQueue<QQMessage> {
  protected queue = TGMSG_QUEUE

  public async addMessage(msg: QQMessage) {
    await this.client.RPUSH(this.queue, JSON.stringify(msg))
  }

  static extractQQInfo = async (msg: any): Promise<QQProfile & QQMsgId> => {
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
      ? await this.client.get(`${QQ_MSG_TO_TG_PREFIX}${msg.replyToMsgId}`)
      : undefined
    const replyMsgId = replyMsgIdStr
      ? parseInt(replyMsgIdStr.split(',')[0])
      : undefined

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
      const msgIds = await this.client.get(
        `${QQ_MSG_TO_TG_PREFIX}${msg.data.msgId}`,
      )
      if (msgIds) {
        for (const msgId of msgIds.split(',')) {
          await this.bot.telegram.deleteMessage(
            process.env.TELEGRAM_GROUP_ID ?? 0,
            parseInt(msgId),
          )
        }
      }
    }

    if (telegramMsgId && msg.qqMsgId) {
      await this.client.SETEX(
        `${TG_MSG_TO_QQ_PREFIX}${telegramMsgId}`,
        24 * 60 * 60,
        `${msg.qqMsgId}`,
      )
      await this.client.SETEX(
        `${QQ_MSG_TO_TG_PREFIX}${msg.qqMsgId}`,
        24 * 60 * 60,
        `${telegramMsgId}`,
      )
    }
  }
}
