import { Telegraf } from 'telegraf'

import { exhentaiBot } from './bots/exhentai'
import { groupBot } from './bots/group'
import { infoBot } from './bots/info'
import { qqBot } from './bots/qq'
import { saucenaoBot } from './bots/saucenao'
import { twitterBot } from './bots/twitter'
import scheduler from './scheduler'

const bot = new Telegraf(process.env.BOT_TOKEN ?? '')

const ALLOWED_GROUP =
  process.env.ALLOWED_GROUP?.split(',').map((e) => parseInt(e)) || []

bot.use(async (ctx, next) => {
  const userId = ctx.from?.id
  const chatId = ctx.chat?.id
  if (chatId && !ALLOWED_GROUP.includes(chatId)) {
    try {
      await ctx.telegram.leaveChat(chatId)
    } catch {}
    console.info('Leave group', ctx.chat)
    return
  }
  console.log(ctx.senderChat?.id)
  if (
    ctx.senderChat?.id !== process.env.TELEGRAM_CHANNEL_ID &&
    ctx.senderChat?.type === 'channel' &&
    chatId
  ) {
    await ctx.telegram.deleteMessage(chatId, ctx.message?.message_id ?? 0)
    const { message_id } = await ctx.telegram.sendMessage(
      chatId,
      '请不要用频道身份发言',
    )
    setTimeout(() => ctx.telegram.deleteMessage(chatId, message_id), 15000)
    return
  }
  if (ctx.senderChat?.type === 'channel') {
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
saucenaoBot(bot)
qqBot(bot)

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
