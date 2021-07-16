import { Telegraf } from 'telegraf'

import { exhentaiBot } from './bots/exhentai'
// import { groupBot } from './bots/group'
import { infoBot } from './bots/info'
import { twitterBot } from './bots/twitter'
import scheduler from './scheduler'

const bot = new Telegraf(process.env.BOT_TOKEN ?? '')

bot.use(async (_, next) => {
  const start = Date.now()
  await next()
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
  const cmd = data.split('|')[0]
  const params = data.split('|')[1]?.split(',')
  switch (cmd) {
    case 'cancel_and_remove': {
      try {
        ctx.tg.deleteMessage(
          groupId,
          ctx.update.callback_query?.message?.message_id ?? 0,
        )
      } catch {}
      break
    }
    case 'remove_message': {
      try {
        await ctx.tg.deleteMessage(groupId, parseInt(params[0]))
      } catch {}
      break
    }
  }
  next()
})

twitterBot(bot)
// groupBot(bot)
infoBot(bot)
exhentaiBot(bot)

scheduler(bot)

bot.launch()
console.log('Bot started.')

// Enable graceful stop
const stop = async () => {
  await bot.stop()
  process.exit()
}
process.once('SIGINT', stop)
process.once('SIGTERM', stop)
