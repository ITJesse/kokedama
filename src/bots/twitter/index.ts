import { Markup, Telegraf } from 'telegraf'

import downloadTweetAll from './func/downloadTweetAll'
import previewTweet from './func/previewTweet'
import previewTweetAll from './func/previewTweetAll'
import { getLikesByName } from './utils'

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
        const replyMsgId = parseInt(params[1])
        await previewTweet(bot, tweetId, groupId, replyMsgId)
        break
      }
      case 'preview_tweet_all': {
        const tweetId = params[0]
        const replyMsgId = parseInt(params[1])
        await previewTweetAll(bot, tweetId, groupId, replyMsgId)
        break
      }
      case 'download_tweet_all': {
        const tweetId = params[0]
        const replyMsgId = parseInt(params[1])
        await downloadTweetAll(bot, tweetId, groupId, replyMsgId)
        break
      }
    }
    next()
  })
}

export const task = async (bot: Telegraf) => {
  const likes = await getLikesByName(process.env.TWITTER_SCREEN_NAME ?? '')
}
