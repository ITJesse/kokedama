import { Markup, Telegraf } from 'telegraf'

import { randomStr } from '@/utils'
import { TWITTER_BIND_SESSION_PREFIX, TWITTER_TOKEN_PREFIX } from '@/utils/consts'
import redis from '@/utils/redis'

import downloadTweetAll from './func/downloadTweetAll'
import downloadTweetVideo from './func/downloadTweetVideo'
import { favoriteTweet } from './func/favoriteTweet'
import previewTweet from './func/previewTweet'
import previewTweetAll from './func/previewTweetAll'

export function twitterBot(bot: Telegraf) {
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
            allow_sending_without_reply: false,
            reply_markup: Markup.inlineKeyboard([
              [
                Markup.button.callback(
                  '显示预览',
                  `preview_tweet|${tweetId},${messageId}`,
                ),
                Markup.button.callback(
                  '下载原图',
                  `download_tweet_images|${tweetId},${messageId}`,
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
      case 'download_tweet_images': {
        const tweetId = params[0]
        const replyMsgId = parseInt(params[1])
        await downloadTweetAll(bot, tweetId, groupId, replyMsgId)
        break
      }
      case 'download_tweet_video': {
        const tweetId = params[0]
        const replyMsgId = parseInt(params[1])
        await downloadTweetVideo(bot, tweetId, groupId, replyMsgId)
        break
      }
      case 'favorite_tweet': {
        const tweetId = params[0]
        await favoriteTweet(
          bot,
          ctx.update.callback_query.from,
          tweetId,
          groupId,
        )
        break
      }
    }
    try {
      await ctx.answerCbQuery('Done')
    } catch (err) {
      console.error(err)
    }
    next()
  })

  bot.command('bind_twitter', async (ctx, next) => {
    const { chat } = ctx.message
    if (chat.type !== 'private') {
      const msg = await ctx.reply('请私聊我该命令', {
        reply_to_message_id: ctx.message.message_id,
        allow_sending_without_reply: true,
      })
      setTimeout(() => ctx.deleteMessage(msg.message_id), 15000)
      return next()
    }
    const sessionKey = randomStr(8)
    const redisKey = TWITTER_BIND_SESSION_PREFIX + sessionKey
    await redis.setex(redisKey, 60 * 5, ctx.from.id)
    const url = `/pub/twitter/connect?session=${sessionKey}`
    let text = `请点击下方链接绑定 Twitter 账号，该链接 5 分钟内有效：`
    if (process.env.NODE_ENV !== 'production') {
      text = `${text}\n${process.env.BASE_URL}${url}`
    }
    await ctx.reply(text, {
      reply_to_message_id: ctx.message.message_id,
      allow_sending_without_reply: true,
      reply_markup:
        process.env.NODE_ENV === 'production'
          ? Markup.inlineKeyboard([[Markup.button.url('前往绑定', url)]])
              .reply_markup
          : undefined,
    })
    next()
  })

  bot.command('unbind_twitter', async (ctx, next) => {
    const { chat } = ctx.message
    if (chat.type !== 'private') {
      const msg = await ctx.reply('请私聊我该命令', {
        reply_to_message_id: ctx.message.message_id,
        allow_sending_without_reply: true,
      })
      setTimeout(() => ctx.deleteMessage(msg.message_id), 15000)
      return next()
    }
    await redis.del(`${TWITTER_TOKEN_PREFIX}${ctx.from.id}`)
    await ctx.reply('解绑成功', {
      reply_to_message_id: ctx.message.message_id,
      allow_sending_without_reply: true,
    })
    next()
  })
}
