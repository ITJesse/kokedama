import axios from 'axios'
import { Markup, Telegraf } from 'telegraf'
import { galleryMetaTemplate } from './templates'
import { galleryUrl, getGalleryMeta } from './utils'

const galleryUrlRegex = /https:\/\/e(x|-)hentai\.org\/g\/(\d+)\/([a-f0-9]+)\//i

export default function exhentaiBot(bot: Telegraf) {
  bot.hears(galleryUrlRegex, async (ctx, next) => {
    const gid = parseInt(ctx.match[2])
    const gtoken = ctx.match[3]
    const meta = await getGalleryMeta(gid, gtoken)
    const { data: thumbnail } = await axios.get(meta.thumb, {
      responseType: 'arraybuffer',
    })

    const content = galleryMetaTemplate(meta)

    await ctx.replyWithPhoto(
      { source: Buffer.from(thumbnail) },
      {
        caption: content,
        parse_mode: 'HTML',
        disable_notification: true,
        reply_markup: Markup.inlineKeyboard([
          [
            // Markup.button.callback(
            //   '打包下载',
            //   `exhentai_download|${gid},${gtoken}`,
            // ),
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
}
