import axios from 'axios'
import { Telegraf } from 'telegraf'

import { getTweetById } from '../utils'

export default async function previewTweetAll(
  bot: Telegraf,
  tweetId: string,
  chatId: number,
  replyMsgId: number,
) {
  const tweet = await getTweetById(tweetId)
  const images = tweet.includes.media?.map((e: any) => e.url)
  if (images) {
    const imageBufs: Buffer[] = await Promise.all(
      images.map((e: any) =>
        axios
          .get(e, { responseType: 'arraybuffer' })
          .then(({ data }) => Buffer.from(data)),
      ),
    )
    bot.telegram.sendMediaGroup(
      chatId,
      imageBufs.map((e) => ({
        type: 'photo',
        media: { source: e },
        caption: 'test',
      })),
      {
        reply_to_message_id: replyMsgId,
        disable_notification: true,
        allow_sending_without_reply: false,
      },
    )
  }
}
