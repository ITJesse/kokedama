import axios from 'axios'
import { Telegraf } from 'telegraf'
import WebSocket from 'ws'

import { resizeImage } from '@/utils'
import { TG_MSG_TO_QQ_PREFIX } from '@/utils/consts'
import redis from '@/utils/redis'

import { facemap } from './face'
import * as qq from './qq'
import { QQMsgQueue, TelegramMsgQueue } from './queue'
import * as utils from './utils'

export function qqBot(bot: Telegraf) {
  const qqMsgQueue = new QQMsgQueue(bot)
  const tgMsgQueue = new TelegramMsgQueue(bot)
  qqMsgQueue.start()
  tgMsgQueue.start()

  bot.command('rm', async (ctx) => {
    const msgId = ctx.message.message_id
    const deleteMsg = ctx.message.reply_to_message

    if (!deleteMsg) {
      await ctx.deleteMessage(msgId)
      return ctx.reply('请回复一条消息', {
        reply_to_message_id: msgId,
        allow_sending_without_reply: true,
      })
    }

    const msgSender = deleteMsg.from?.id
    const commandSender = ctx.message.from.id
    if (msgSender !== commandSender) {
      await ctx.deleteMessage(msgId)
      return ctx.reply('你只能撤回自己的消息', {
        reply_to_message_id: msgId,
        allow_sending_without_reply: true,
      })
    }

    const qqMsgId = await redis.GET(
      `${TG_MSG_TO_QQ_PREFIX}${deleteMsg.message_id}`,
    )
    if (qqMsgId) {
      await qq.deleteMsg(qqMsgId)
    }
    await ctx.deleteMessage(msgId)
  })

  bot.on('text', async (ctx, next) => {
    const chatId = ctx.chat.id
    if (
      `${chatId}` !== process.env.TELEGRAM_GROUP_ID ||
      ctx.message.from.is_bot
    ) {
      return next()
    }

    await qqMsgQueue.addMessage({
      ...QQMsgQueue.extractTelegramInfo(ctx),
      type: 'text',
      data: ctx.message.text,
    })
    next()
  })

  bot.on('sticker', async (ctx, next) => {
    const chatId = ctx.chat.id
    if (
      `${chatId}` !== process.env.TELEGRAM_GROUP_ID ||
      ctx.message.from.is_bot
    ) {
      return next()
    }
    const stickerUrl = await bot.telegram.getFileLink(
      ctx.message.sticker.thumb?.file_id ?? ctx.message.sticker.file_id,
    )
    const { data } = await axios.get(stickerUrl.href, {
      responseType: 'arraybuffer',
    })
    const buf = await resizeImage(data, { width: 128 })

    await qqMsgQueue.addMessage({
      ...QQMsgQueue.extractTelegramInfo(ctx),
      type: 'image',
      data: {
        image: `base64://${buf.toString('base64')}`,
        msgId: ctx.message.message_id,
      },
    })
    next()
  })

  bot.on('photo', async (ctx, next) => {
    const chatId = ctx.chat.id
    if (
      `${chatId}` !== process.env.TELEGRAM_GROUP_ID ||
      ctx.message.from.is_bot
    ) {
      return next()
    }
    const imageUrl = await bot.telegram.getFileLink(
      ctx.message.photo.sort(
        (a, b) => b.width * b.height - a.width * a.height,
      )[0].file_id,
    )
    await qqMsgQueue.addMessage({
      ...QQMsgQueue.extractTelegramInfo(ctx),
      type: 'image',
      data: {
        image: imageUrl.href,
        caption: ctx.message.caption,
        groupId: ctx.message.media_group_id,
        msgId: ctx.message.message_id,
      },
    })
    // await redis.setex(
    //   `${QQ_MSG_TO_TG_PREFIX}${message_id}`,
    //   24 * 60 * 60,
    //   `${ctx.message.message_id}`,
    // )
    next()
  })

  bot.on('video', async (ctx, next) => {
    const chatId = ctx.chat.id
    if (
      `${chatId}` !== process.env.TELEGRAM_GROUP_ID ||
      ctx.message.from.is_bot
    ) {
      return next()
    }
    const videoUrl = await bot.telegram.getFileLink(ctx.message.video.file_id)
    await qqMsgQueue.addMessage({
      ...QQMsgQueue.extractTelegramInfo(ctx),
      type: 'video',
      data: {
        video: videoUrl.href,
        caption: ctx.message.caption,
      },
    })
    next()
  })

  bot.on('animation', async (ctx, next) => {
    const chatId = ctx.chat.id
    if (
      `${chatId}` !== process.env.TELEGRAM_GROUP_ID ||
      ctx.message.from.is_bot
    ) {
      return next()
    }
    const videoUrl = await bot.telegram.getFileLink(
      ctx.message.animation.file_id,
    )
    await qqMsgQueue.addMessage({
      ...QQMsgQueue.extractTelegramInfo(ctx),
      type: 'video',
      data: {
        video: videoUrl.href,
        caption: ctx.message.caption,
      },
    })
    next()
  })

  const ws: WebSocket = new WebSocket(process.env.CQHTTP_WS_ENDPOINT ?? '')

  ws.on('open', () => console.log('CQHTTP WebSocket connected'))
  ws.on('close', () => process.exit(1))
  ws.on('message', async (data) => {
    const res = JSON.parse(data.toString())
    const message_type = res.message_type
    const group_id = res.group_id

    if (message_type === 'group' && `${group_id}` === process.env.QQ_GROUP_ID) {
      if (res.post_type !== 'message') {
        return
      }
      if (res.sender.user_id === 193468621) {
        return
      }

      const videos = res.message.filter((e: any) => e.type === 'video')
      const images = res.message.filter((e: any) => e.type === 'image')
      const texts = res.message.filter(
        (e: any) => e.type === 'text' || e.type === 'face',
      )

      const gifs: any[] = []
      const trueImages: any[] = []
      for (const image of images) {
        const { headers } = await axios.head(image.data.url)
        const mime = headers['content-type']
        if (mime.includes('gif')) {
          gifs.push(image)
        } else {
          trueImages.push(image)
        }
      }

      if (texts.some((e: any) => utils.hasBlacklistedWord(e.data.text ?? ''))) {
        return
      }

      const text = texts
        .map((e: any) => {
          if (e.type === 'text') {
            return e.data.text
          } else if (e.type === 'face') {
            const faceText = facemap[e.data.id] ?? '表情'
            return `[${faceText}]`
          }
        })
        .join('')
        .trim()
      if (text.length > 0) {
        await tgMsgQueue.addMessage({
          ...(await TelegramMsgQueue.extractQQInfo(res)),
          type: 'text',
          data: text,
        })
      }

      for (const video of videos) {
        await tgMsgQueue.addMessage({
          ...(await TelegramMsgQueue.extractQQInfo(res)),
          type: 'video',
          data: {
            video: video.data.url,
          },
        })
      }

      for (const gif of gifs) {
        await tgMsgQueue.addMessage({
          ...(await TelegramMsgQueue.extractQQInfo(res)),
          type: 'animation',
          data: {
            video: gif.data.url,
          },
        })
      }

      for (const image of trueImages) {
        await tgMsgQueue.addMessage({
          ...(await TelegramMsgQueue.extractQQInfo(res)),
          type: 'image',
          data: {
            msgId: res.message_id,
            image: image.data.url,
          },
        })
      }
    }

    if (
      res.post_type === 'notice' &&
      res.notice_type === 'group_recall' &&
      `${group_id}` === process.env.QQ_GROUP_ID
    ) {
      await tgMsgQueue.addMessage({
        ...(await TelegramMsgQueue.extractQQInfo(res)),
        type: 'recall',
        data: {
          msgId: res.message_id,
        },
      })
    }

    if (
      res.post_type === 'notice' &&
      res.notice_type === 'group_upload' &&
      `${group_id}` === process.env.QQ_GROUP_ID
    ) {
      if (res.file?.size > 50 * 1024 * 1024) {
        return
      }
      if (/\.mp4$/i.test(res.file?.name)) {
        await tgMsgQueue.addMessage({
          ...(await TelegramMsgQueue.extractQQInfo(res)),
          type: 'video',
          data: {
            video: res.file.url,
          },
        })
      }
      if (/\.(jpe?g|png|bmp)$/i.test(res.file?.name)) {
        await tgMsgQueue.addMessage({
          ...(await TelegramMsgQueue.extractQQInfo(res)),
          type: 'image',
          data: {
            msgId: 0,
            image: res.file.url,
          },
        })
      }
      // if (/\.gif$/i.test(res.file?.name)) {
      //   await tgMsgQueue.addMessage({
      //     ...(await TelegramMsgQueue.extractQQInfo(res)),
      //     type: 'animation',
      //     data: {
      //       video: res.file.url,
      //     },
      //   })
      // }
    }
  })
}
