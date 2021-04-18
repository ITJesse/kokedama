import fs from 'fs'
import path from 'path'
import Telegraf from 'telegraf'

import * as redis from './redis'

const welcom = fs
  .readFileSync(path.resolve(__dirname, '../templates/welcome.txt'))
  .toString()

const bot = new Telegraf(process.env.BOT_TOKEN ?? '')

const GROUP_MEMBER_PREFIX = 'TELEGRAM_GROUP_MEMERS_'

bot.telegram.getMe().then((botInfo) => {
  bot.options.username = botInfo.username
})

bot.use(async (_, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  console.log('Response time: %sms', ms)
})

bot.command('info', (ctx) => {
  const groupId = ctx.chat?.id
  if (!groupId) {
    return
  }

  const from = ctx.update.message?.from
  const msg = `Group ID: ${groupId}\nUser ID: ${from?.id}`
  ctx.telegram.sendMessage(groupId, msg)
})

bot.on('new_chat_members', (ctx) => {
  const groupId = ctx.chat?.id
  if (!groupId || groupId !== parseInt(process.env.TELEGRAM_GROUP_ID ?? '')) {
    return
  }

  ctx.message?.new_chat_members
    ?.filter((m) => !m.is_bot)
    .forEach(async (m) => {
      const username = m.username
        ? `@${m.username.replace(/_/g, '\\_')}`
        : `[${m.last_name} ${m.first_name}](tg://user?id=${m.id})`
      const msg = welcom.replace('{username}', username)
      ctx.telegram.sendMessage(groupId, msg, { parse_mode: 'MarkdownV2' })
      await redis.hset([
        `${GROUP_MEMBER_PREFIX}${groupId}`,
        `${m.id}`,
        `${Date.now()}`,
      ])
    })
})

bot.on('left_chat_member', async (ctx) => {
  const groupId = ctx.update.message?.chat.id
  if (!groupId || groupId !== parseInt(process.env.TELEGRAM_GROUP_ID ?? '')) {
    return
  }

  const fromId = ctx.update.message?.left_chat_member?.id
  if (!fromId || ctx.update.message?.left_chat_member?.is_bot) {
    return
  }
  await redis.hdel([`${GROUP_MEMBER_PREFIX}${groupId}`, `${fromId}`])
})

bot.on('message', async (ctx) => {
  const groupId = ctx.update.message?.chat.id
  if (!groupId || groupId !== parseInt(process.env.TELEGRAM_GROUP_ID ?? '')) {
    return
  }
  const fromId = ctx.update.message?.from?.id
  if (!fromId) {
    return
  }
  await redis.hset([
    `${GROUP_MEMBER_PREFIX}${groupId}`,
    `${fromId}`,
    `${Date.now()}`,
  ])
})

bot.launch()
console.log('Bot started.')

// Enable graceful stop
const stop = async () => {
  await bot.stop()
  process.exit()
}
process.once('SIGINT', stop)
process.once('SIGTERM', stop)
