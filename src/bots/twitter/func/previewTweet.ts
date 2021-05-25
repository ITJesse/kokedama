import axios from 'axios'
import { Markup, Telegraf } from 'telegraf'

import { getTweetById, getTweetUrl, getUserUrl } from '../utils'

export default async function previewTweet(
  bot: Telegraf,
  tweetId: string,
  chatId: number,
  replyMsgId: number,
) {
  const tweet = await getTweetById(tweetId)
  const images = tweet.includes.media?.map(
    (e: any) => e.url ?? e.preview_image_url,
  )
  const content = `${tweet.data.text}`

  if (!images) {
    bot.telegram.sendMessage(chatId, content, {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      disable_notification: true,
      reply_markup: Markup.inlineKeyboard([
        [
          Markup.button.url(
            `作者：${tweet.includes.users[0].name}`,
            getUserUrl(tweet.includes.users[0].username),
          ),
          Markup.button.url(
            '原文链接',
            getTweetUrl(tweet.includes.users[0].username, tweetId),
          ),
        ],
      ]).reply_markup,
    })
  } else {
    const imageBufs: Buffer[] = await Promise.all(
      images.map((e: any) =>
        axios
          .get(e, { responseType: 'arraybuffer' })
          .then(({ data }) => Buffer.from(data)),
      ),
    )
    const link = `\n\n查看作者`

    bot.telegram.sendMediaGroup(
      chatId,
      imageBufs.map((e, index) => ({
        type: 'photo',
        media: { source: e },
        caption: index === 0 ? content + link : undefined,
        caption_entities:
          index === 0
            ? [
                {
                  offset: content.length + 2,
                  length: 4,
                  type: 'text_link',
                  url: getUserUrl(tweet.includes.users[0].username),
                },
              ]
            : undefined,
      })),
      {
        reply_to_message_id: replyMsgId,
        disable_notification: true,
      },
    )
  }
}
