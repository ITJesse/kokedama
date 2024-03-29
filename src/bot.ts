import { Telegraf } from 'telegraf'

import redis from '@/utils/redis'

import { exhentaiBot } from './bots/exhentai'
import { groupBot } from './bots/group'
import { infoBot } from './bots/info'
import { twitterBot } from './bots/twitter'
import { waifuBot } from './bots/waifu2x'
import { woocommerceBot } from './bots/woocommerce'
import scheduler from './scheduler'
import { CMD_DEBOUNCE_PREFIX } from './utils/consts'

export const startBot = () => {
  const bot = new Telegraf(process.env.BOT_TOKEN ?? '')

  const ALLOWED_GROUP =
    process.env.ALLOWED_GROUP?.split(',').map((e) => parseInt(e)) || []

  bot.use(async (ctx, next) => {
    const chatId = ctx.chat?.id
    if (
      chatId &&
      !ALLOWED_GROUP.includes(chatId) &&
      ctx.chat?.type !== 'private'
    ) {
      try {
        await ctx.telegram.leaveChat(chatId)
      } catch {}
      console.info('Leave group', ctx.chat)
      return
    }
    const start = Date.now()
    try {
      await next()
    } catch (err) {
      console.error(err)
      if (chatId) {
        await ctx.telegram.sendMessage(chatId, '发生错误')
      }
    }
    const ms = Date.now() - start
    console.log('Response time: %sms', ms)
  })

  bot.on('callback_query', async (ctx, next) => {
    const groupId = ctx.update.callback_query?.message?.chat.id
    if (!('data' in ctx.update.callback_query)) {
      return next()
    }
    const data = ctx.update.callback_query.data
    if (!data || !groupId) {
      return next()
    }

    const cmdTriggered = await redis.get(`${CMD_DEBOUNCE_PREFIX}${data}`)
    if (cmdTriggered) return
    await redis.setex(`${CMD_DEBOUNCE_PREFIX}${data}`, 10, '1')

    const cmd = data.split('|')[0]
    const params = data.split('|')[1]?.split(',')
    switch (cmd) {
      case 'cancel_and_remove': {
        try {
          ctx.telegram.deleteMessage(
            groupId,
            ctx.update.callback_query?.message?.message_id ?? 0,
          )
        } catch {}
        break
      }
      case 'remove_message': {
        try {
          await ctx.telegram.deleteMessage(groupId, parseInt(params[0]))
        } catch {}
        break
      }
      case 'nop': {
        break
      }
    }
    await ctx.answerCbQuery('')
    next()
  })

  twitterBot(bot)
  groupBot(bot)
  infoBot(bot)
  exhentaiBot(bot)
  // saucenaoBot(bot)
  waifuBot(bot)
  woocommerceBot(bot)

  scheduler(bot)

  bot.telegram.setMyCommands([
    {
      command: 'info',
      description: '获取用户 ID 和群组 ID',
    },
    {
      command: 'waifu2x',
      description: '图片超分辨率',
    },
    {
      command: 'like',
      description: '收藏推文',
    },
    {
      command: 'bind_twitter',
      description: '绑定推特账号（仅限私聊）',
    },
    {
      command: 'unbind_twitter',
      description: '解绑推特账号（仅限私聊）',
    },
  ])

  bot.launch()
  console.log('Bot started.')

  // Enable graceful stop
  const stop = async () => {
    await bot.stop()
    process.exit()
  }
  process.once('SIGINT', stop)
  process.once('SIGTERM', stop)

  return bot
}
