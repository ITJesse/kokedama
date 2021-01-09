import fs from 'fs'
import path from 'path'
import Telegraf from 'telegraf'

const welcom = fs
  .readFileSync(path.resolve(__dirname, '../templates/welcome.txt'))
  .toString()

const bot = new Telegraf(process.env.BOT_TOKEN ?? '')

bot.use(async (_, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  console.log('Response time: %sms', ms)
})

bot.on('new_chat_members', (ctx) => {
  const groupId = ctx.chat?.id
  console.log(groupId)
  if (!groupId) {
    return
  }

  ctx.message?.new_chat_members
    ?.filter((m) => !m.is_bot)
    .forEach((member) => {
      console.log(member)
      const username = member.username
        ? `@${member.username.replace(/_/g, '\\_')}`
        : `[${member.last_name} ${member.first_name}](tg://user?id=${member.id})`
      const msg = welcom.replace('{username}', username)
      ctx.telegram.sendMessage(groupId, msg, { parse_mode: 'MarkdownV2' })
    })
})
bot.launch()
console.log('Bot started.')

// Enable graceful stop
process.once('SIGINT', () => bot.stop())
process.once('SIGTERM', () => bot.stop())
