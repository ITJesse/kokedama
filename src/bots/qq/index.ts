import axios from 'axios'
import sharp from 'sharp'
import { Markup, Telegraf } from 'telegraf'
import WebSocket from 'ws'

import { getName, getProfilePhoto, sendImage } from '@/utils'
import { QQ_MSG_TO_TG_PREFIX, TG_MSG_TO_QQ_PREFIX } from '@/utils/consts'
import * as redis from '@/utils/redis'

import { buildQQMessage } from './templates'
import * as qq from './utils'

export function qqBot(bot: Telegraf) {
  bot.on('text', async (ctx, next) => {
    const chatId = ctx.chat.id
    if (
      `${chatId}` !== process.env.TELEGRAM_GROUP_ID ||
      ctx.message.from.is_bot
    ) {
      return next()
    }

    const username = getName(ctx.message.from)
    const profilePhoto = await getProfilePhoto(bot, ctx.message.from.id)

    const message = buildQQMessage({
      profilePhoto,
      username,
      message: ctx.message.text,
    })
    await qq.sendImage(profilePhoto, message)
    // await qq.sendMessage(message)
    // await redis.setex(
    //   `${QQ_MSG_TO_TG_PREFIX}${message_id}`,
    //   24 * 60 * 60,
    //   `${ctx.message.message_id}`,
    // )
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
    const username = getName(ctx.message.from)
    const profilePhoto = await getProfilePhoto(bot, ctx.message.from.id)
    const stickerUrl = await bot.telegram.getFileLink(
      ctx.message.sticker.thumb?.file_id ?? ctx.message.sticker.file_id,
    )
    const { data } = await axios.get(stickerUrl.href, {
      responseType: 'arraybuffer',
    })
    const buf = await sharp(data).toFormat('png').toBuffer()
    const message = buildQQMessage({
      profilePhoto,
      username,
      message: `[CQ:image,file=base64://${buf.toString('base64')}]`,
    })
    await qq.sendMessage(message)
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
    const profilePhoto = await getProfilePhoto(bot, ctx.message.from.id)
    const imageUrl = await bot.telegram.getFileLink(
      ctx.message.photo.sort(
        (a, b) => b.width * b.height - a.width * a.height,
      )[0].file_id,
    )
    const username = getName(ctx.message.from)
    const message = buildQQMessage({
      profilePhoto,
      username,
      message:
        `[CQ:image,file=${imageUrl.href}]` +
        (ctx.message.caption ? `\n${ctx.message.caption}` : ''),
    })
    await qq.sendMessage(message)
    // await redis.setex(
    //   `${QQ_MSG_TO_TG_PREFIX}${message_id}`,
    //   24 * 60 * 60,
    //   `${ctx.message.message_id}`,
    // )
    next()
  })

  const ws: WebSocket = new WebSocket(process.env.CQHTTP_WS_ENDPOINT ?? '')

  ws.on('open', () => console.log('CQHTTP WebSocket connected'))
  ws.on('close', () => process.exit(1))
  ws.on('message', async (data) => {
    const res = JSON.parse(data.toString())
    const message_type = res.message_type
    const group_id = res.group_id
    if (message_type !== 'group' || `${group_id}` !== process.env.QQ_GROUP_ID) {
      return
    }

    if (res.sender.user_id === 193468621) {
      return
    }

    const postType = res.post_type

    const username = `${res.sender.title ? `[${res.sender.title}]` : ''} ${
      res.sender.nickname
    }`
    if (postType === 'message') {
      const images = res.message.filter((e: any) => e.type === 'image')
      const texts = res.message.filter((e: any) => e.type === 'text')

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

      for (const gif of gifs) {
        await bot.telegram.sendAnimation(
          process.env.TELEGRAM_GROUP_ID ?? 0,
          gif.data.url,
        )
      }

      if (trueImages.length === 1) {
        await bot.telegram.sendPhoto(
          process.env.TELEGRAM_GROUP_ID ?? 0,
          trueImages[0].data.url,
        )
      }
      if (trueImages.length > 1) {
        for (let i = 0; i < trueImages.length; i += 10) {
          const imagesToSend = trueImages.slice(i, i + 10)
          await bot.telegram.sendMediaGroup(
            process.env.TELEGRAM_GROUP_ID ?? 0,
            imagesToSend.map((e: any) => ({
              type: 'photo',
              media: e.data.url,
            })),
          )
        }
      }

      const content = texts.map((e: any) => e.data.text).join('')
      const message =
        content.length > 0
          ? `<b>${username} 说：</b>\n${content}`
          : `<b>${username}</b>`
      const { message_id } = await bot.telegram.sendMessage(
        process.env.TELEGRAM_GROUP_ID ?? 0,
        message,
        {
          parse_mode: 'HTML',
          reply_markup: Markup.inlineKeyboard([
            [Markup.button.callback(`来自QQ的消息`, 'nop')],
          ]).reply_markup,
        },
      )
      // await redis.setex(
      //   `${TG_MSG_TO_QQ_PREFIX}${message_id}`,
      //   24 * 60 * 60,
      //   `${res.message_id}`,
      // )
    }
    // console.log(res.message[0])
  })
}
