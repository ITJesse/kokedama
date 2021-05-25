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
    const { data } = await axios.get(images[0], {
      responseType: 'arraybuffer',
    })
    bot.telegram.sendPhoto(
      chatId,
      { source: Buffer.from(data) },
      {
        caption: content,
        parse_mode: 'HTML',
        disable_notification: true,
        reply_to_message_id: replyMsgId,
        reply_markup: Markup.inlineKeyboard([
          [
            ...(images.length > 1
              ? [
                  Markup.button.callback(
                    `全部预览（共${images.length}张）`,
                    `preview_tweet_all|${tweetId},${replyMsgId}`,
                  ),
                ]
              : []),
            Markup.button.callback(
              `下载原图（共${images.length}张）`,
              `download_tweet_all|${tweetId},${replyMsgId}`,
            ),
          ],
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
      },
    )
  }
}
