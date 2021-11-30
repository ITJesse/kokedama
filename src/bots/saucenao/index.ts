import axios from 'axios'
import { Telegraf } from 'telegraf'

import { search } from './utils'

export function saucenaoBot(bot: Telegraf) {
  bot.on('photo', async (ctx, next) => {
    const chatId = ctx.chat?.id
    if (!chatId) {
      return next()
    }

    const imageUrl = await bot.telegram.getFileLink(
      ctx.message.photo.sort(
        (a, b) => b.width * b.height - a.width * a.height,
      )[1].file_id,
    )
    const { data } = await axios.get(imageUrl.href, {
      responseType: 'arraybuffer',
      timeout: 10000,
    })
    const result = (
      await search(data, {
        results: 20,
        // mask: [5, 6, 18, 29, 38, 40, 41, 42],
      })
    ).filter((e) => e.similarity > 80)
    if (result.length === 0) {
      return next()
    }
    console.log(result)

    const msg = result
      .slice(0, 4)
      .map((e) =>
        [
          `<b>${e.site}</b> - 作者：<a href="${e.authorUrl}">${e.authorName}</a>`,
          `相似度：${e.similarity}%`,
          `来源网址：<a href="${e.url}">${e.url}</a>`,
        ].join('\n'),
      )
      .join('\n\n')
    bot.telegram.sendMessage(chatId, msg, {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      reply_to_message_id: ctx.message.message_id,
    })
    next()
  })
}
