import axios from 'axios'
import { Markup, Telegraf } from 'telegraf'

import { getVideoDimensions } from '@/bots/qq/utils'
import { signUrl } from '@/utils/oss'

import { getTweetById, getTweetUrl, getUserUrl } from '../utils'

export default async function previewTweetVideo(
  bot: Telegraf,
  tweetOrId: string,
  chatId: number,
  replyMsgId?: number,
) {
  const tweet =
    typeof tweetOrId === 'string' ? await getTweetById(tweetOrId) : tweetOrId
  const tweetId = tweet.data.id

  const video =
    tweet.includes?.media?.some(
      (e: any) => e.type === 'video' || e.type === 'animated_gif',
    ) ?? false
  if (video) {
    const markup = Markup.inlineKeyboard([
      [
        Markup.button.callback(
          `下载视频`,
          `download_tweet_video|${tweetId},${replyMsgId}`,
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
    ]).reply_markup

    const { message_id } = await bot.telegram.sendVideo(
      chatId,
      signUrl('/sample/upload.mp4'),
      {
        caption: `${tweet.data.text}`,
        parse_mode: 'HTML',
        reply_to_message_id: replyMsgId,
        allow_sending_without_reply: true,
        reply_markup: markup,
        disable_notification: true,
      },
    )

    const videoUrl = tweet.includes.media[0].variants
      .filter((e: any) => e.content_type === 'video/mp4')
      .sort((a: any, b: any) => b.bit_rate - a.bit_rate)[0].url
    const videoBuf = await axios
      .get(videoUrl, {
        responseType: 'arraybuffer',
      })
      .then(({ data }) => Buffer.from(data))
    const { width, height } = await getVideoDimensions(Buffer.from(videoBuf))
    await bot.telegram.editMessageMedia(
      chatId,
      message_id,
      undefined,
      {
        type: 'video',
        media: {
          source: Buffer.from(videoBuf),
          filename: `${tweetId}_video.mp4`,
        },
        caption: `${tweet.data.text}`,
        width,
        height,
        parse_mode: 'HTML',
      },
      {
        reply_markup: markup,
      },
    )
  }
}
