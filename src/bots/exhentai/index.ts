import axios from 'axios'
import { Markup, Telegraf } from 'telegraf'
import { galleryMetaTemplate } from './templates'
import { GalleryMeta } from './types'
import {
  exhentaiApi,
  galleryUrl,
  getGalleryMeta,
  getGalleryToken,
} from './utils'

const galleryUrlRegex = /https:\/\/e(x|-)hentai\.org\/g\/(\d+)\/([a-f0-9]+)\//i
const galleryPageUrlRegex =
  /https:\/\/e(x|-)hentai\.org\/s\/([a-f0-9]+)\/(\d+)-(\d+)/i

export default function exhentaiBot(bot: Telegraf) {
  bot.hears([galleryUrlRegex, galleryPageUrlRegex], async (ctx, next) => {
    let gid: number
    let gtoken: string

    if (ctx.match[0].includes('/g/')) {
      gid = parseInt(ctx.match[2])
      gtoken = ctx.match[3]
    } else {
      gid = parseInt(ctx.match[3])
      const ptoken = ctx.match[2]
      const page = parseInt(ctx.match[4])
      const { token } = await getGalleryToken(gid, ptoken, page)
      gtoken = token
    }

    const meta = await getGalleryMeta(gid, gtoken)
    const { data: thumbnail } = await exhentaiApi.get(meta.thumb, {
      responseType: 'arraybuffer',
    })

    const content = galleryMetaTemplate(meta)

    await ctx.tg.sendPhoto(
      ctx.update.message.chat.id,
      { source: Buffer.from(thumbnail) },
      {
        caption: content,
        parse_mode: 'HTML',
        disable_notification: true,
        reply_to_message_id: ctx.update.message.message_id,
        reply_markup: Markup.inlineKeyboard([
          [
            Markup.button.callback(
              '打包下载',
              `exhentai_download|${gid},${gtoken}`,
            ),
            Markup.button.url(
              '原文链接',
              galleryUrl(gid, gtoken, meta.expunged),
            ),
          ],
        ]).reply_markup,
      },
    )
    next()
  })

  // bot.hears(galleryPageUrlRegex, async (ctx, next) => {
  //   const ptoken = ctx.match[2]
  //   const gid = parseInt(ctx.match[3])
  //   const page = parseInt(ctx.match[4])

  //   const { token } = await getGalleryToken(gid, ptoken, page)
  //   const meta = await getGalleryMeta(gid, token)
  // })
}
