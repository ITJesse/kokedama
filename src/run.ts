import express from 'express'
import morgan from 'morgan'
import { Telegraf } from 'telegraf'

import { exhentaiBot } from './bots/exhentai'
import exhentaiApi from './bots/exhentai/api'
// import { groupBot } from './bots/group'
import { infoBot } from './bots/info'
import { saucenaoBot } from './bots/saucenao'
import { twitterBot } from './bots/twitter'
import scheduler from './scheduler'

const bot = new Telegraf(process.env.BOT_TOKEN ?? '')

const ALLOWED_GROUP =
  process.env.ALLOWED_GROUP?.split(',').map((e) => parseInt(e)) || []

bot.use(async (ctx, next) => {
  const chatId = ctx.chat?.id
  if (chatId && !ALLOWED_GROUP.includes(chatId)) {
    try {
      await ctx.telegram.leaveChat(chatId)
    } catch {}
    console.info('Leave group', ctx.chat)
    return
  }
  const start = Date.now()
  try {
    await next()
  } catch {
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
  }
  next()
})

twitterBot(bot)
// groupBot(bot)
infoBot(bot)
exhentaiBot(bot)
saucenaoBot(bot)

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

// API Server
const app = express()
const port = process.env.PORT ?? 3000

app.use(morgan('combined'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/s/:gid/:gtoken', (req, res) => {
  const { gid, gtoken } = req.params
  res.redirect(
    `${process.env.EXHENTAI_NFS_BASEURL}/${gid}/${gtoken}/archive.7z`,
    301,
  )
})

app.use('/api', (req, res, next) => {
  const auth = req.headers['x-kokedama-auth-key']
  if (!auth || auth !== process.env.API_KEY) {
    return res.status(401).json({ success: false, message: 'auth failed' })
  }
  next()
})
app.use('/api', exhentaiApi)

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`)
})
