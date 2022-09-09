import { Markup, Telegraf } from 'telegraf'

import { multipartDownload } from '@/utils'

import { getTweetById, getTweetUrl, getUserUrl } from '../utils'
import previewTweetVideo from './previewTweetVideo'

export default async function previewTweet(
  bot: Telegraf,
  tweetId: string,
  chatId: number,
  replyMsgId?: number,
) {
  const tweet = await getTweetById(tweetId)
  if (tweet.errors?.length > 0) {
    console.error(tweet.errors)
    return
  }
  const images = tweet.includes?.media?.map(
    (e: any) => e.url ?? e.preview_image_url,
  )
  const video = tweet.includes?.media?.find(
    (e: any) => e.type === 'video' || e.type === 'animated_gif',
  )
  if (video) return previewTweetVideo(bot, tweet, chatId, replyMsgId)

  const content = `${tweet.data.text}`
  if (!images) {
    bot.telegram.sendMessage(chatId, content, {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      disable_notification: true,
      allow_sending_without_reply: false,
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
      images.map((e: any) => multipartDownload(e)),
    )

    bot.telegram.sendPhoto(
      chatId,
      { source: Buffer.from(imageBufs[0]) },
      {
        caption: content,
        parse_mode: 'HTML',
        disable_notification: true,
        reply_to_message_id: replyMsgId,
        allow_sending_without_reply: false,
        reply_markup: Markup.inlineKeyboard([
          [
            Markup.button.callback(
              `下载原图（共${images.length}张）`,
              `download_tweet_images|${tweetId},${replyMsgId}`,
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

    if (imageBufs.length > 1) {
      bot.telegram.sendMediaGroup(
        chatId,
        imageBufs.slice(1).map((e) => ({
          type: 'photo',
          media: { source: e },
        })),
        {
          reply_to_message_id: replyMsgId,
          disable_notification: true,
          allow_sending_without_reply: false,
        },
      )
    }
  }
}
