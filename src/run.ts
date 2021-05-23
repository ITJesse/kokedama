import { Telegraf } from 'telegraf'

import groupBot from './bots/group'
import infoBot from './bots/info'
import twitterBot from './bots/twitter'

const bot = new Telegraf(process.env.BOT_TOKEN ?? '')

bot.use(async (_, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  console.log('Response time: %sms', ms)
})

twitterBot(bot)
groupBot(bot)
infoBot(bot)

bot.launch()
console.log('Bot started.')

// Enable graceful stop
const stop = async () => {
  await bot.stop()
  process.exit()
}
process.once('SIGINT', stop)
process.once('SIGTERM', stop)
