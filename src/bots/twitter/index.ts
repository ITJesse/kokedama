import axios from 'axios'
import { Markup, Telegraf } from 'telegraf'

import { getOrigImgUrl, getTweetById, getTweetUrl, getUserUrl } from './utils'

export default function twitterBot(bot: Telegraf) {
  bot.hears(
    /https:\/\/twitter\.com\/(\w+)\/status\/(\d+)/,
    async (ctx, next) => {
      const groupId = ctx.update.message.chat.id
      const messageId = ctx.update.message.message_id
      if (ctx.match && groupId) {
        const tweetId = ctx.match[2]
        // const tweet = await getTweetById(tweetId)
        const msg = await ctx.tg.sendMessage(
          groupId,
          '发现 Twitter 链接，请选择操作：',
          {
            disable_notification: true,
            reply_to_message_id: messageId,
            parse_mode: 'MarkdownV2',
            reply_markup: Markup.inlineKeyboard([
              [
                Markup.button.callback(
                  '显示预览',
                  `preview_tweet|${tweetId},${messageId}`,
                ),
                Markup.button.callback(
                  '下载原图',
                  `download_tweet_all|${tweetId},${messageId}`,
                ),
              ],
            ]).reply_markup,
          },
        )
        setTimeout(async () => {
          try {
            await ctx.tg.deleteMessage(msg.chat.id, msg.message_id)
          } catch {}
        }, 30000)
      }
      next()
    },
  )

  bot.on('callback_query', async (ctx, next) => {
    const groupId = ctx.update.callback_query?.message?.chat.id
    if (!('data' in ctx.update.callback_query)) {
      return next()
    }
    const data = ctx.update.callback_query.data
    if (!data || !groupId) {
      return next()
    }
    const cmd = data.split('|')[0]
    const params = data.split('|')[1]?.split(',')

    switch (cmd) {
      case 'preview_tweet': {
        const tweetId = params[0]
        const tweet = await getTweetById(tweetId)
        const images = tweet.includes.media?.map(
          (e: any) => e.url ?? e.preview_image_url,
        )
        const content = `${tweet.data.text}`
        if (!images) {
          ctx.tg.sendMessage(groupId, content, {
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
          ctx.tg.sendPhoto(
            groupId,
            { source: Buffer.from(data) },
            {
              caption: content,
              parse_mode: 'HTML',
              disable_notification: true,
              reply_to_message_id: parseInt(params[1]),
              reply_markup: Markup.inlineKeyboard([
                [
                  ...(images.length > 1
                    ? [
                        Markup.button.callback(
                          `全部预览（共${images.length}张）`,
                          `preview_tweet_all|${tweetId},${params[1]}`,
                        ),
                      ]
                    : []),
                  Markup.button.callback(
                    `下载原图（共${images.length}张）`,
                    `download_tweet_all|${tweetId},${params[1]}`,
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
        break
      }
      case 'preview_tweet_all': {
        const tweetId = params[0]
        const tweet = await getTweetById(tweetId)
        const images = tweet.includes.media?.map((e: any) => e.url)
        if (!images) {
          break
        } else {
          const imageBufs: Buffer[] = await Promise.all(
            images.map((e: any) =>
              axios
                .get(e, { responseType: 'arraybuffer' })
                .then(({ data }) => Buffer.from(data)),
            ),
          )
          ctx.tg.sendMediaGroup(
            groupId,
            imageBufs.map((e) => ({
              type: 'photo',
              media: { source: e },
            })),
            {
              reply_to_message_id: parseInt(params[1]),
              disable_notification: true,
            },
          )
        }
        break
      }
      case 'download_tweet_all': {
        const tweetId = params[0]
        const tweet = await getTweetById(tweetId)
        const images = tweet.includes.media?.map((e: any) =>
          getOrigImgUrl(e.url),
        )
        if (!images) {
          break
        } else {
          const imageBufs: Buffer[] = await Promise.all(
            images.map((e: any) =>
              axios
                .get(e, { responseType: 'arraybuffer' })
                .then(({ data }) => Buffer.from(data)),
            ),
          )
          ctx.tg.sendMediaGroup(
            groupId,
            imageBufs.map((e, i) => ({
              type: 'document',
              media: { filename: `${tweetId}_${i + 1}.jpg`, source: e },
            })),
            {
              reply_to_message_id: parseInt(params[1]),
              disable_notification: true,
            },
          )
        }
        break
      }
    }
    next()
  })
}
