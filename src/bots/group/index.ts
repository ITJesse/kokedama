import fs from 'fs'
import path from 'path'
import { Telegraf } from 'telegraf'

const welcom = fs
  .readFileSync(path.resolve(__dirname, '../../../templates/welcome.txt'))
  .toString()

export function groupBot(bot: Telegraf) {
  bot.on('new_chat_members', (ctx, next) => {
    const groupId = ctx.chat?.id
    if (!groupId) {
      return next()
    }

    ctx.message?.new_chat_members
      ?.filter((m) => !m.is_bot)
      .forEach(async (m) => {
        const username = m.username
          ? `@${m.username.replace(/_/g, '\\_')}`
          : `[${m.last_name} ${m.first_name}](tg://user?id=${m.id})`
        const msg = welcom.replace('{username}', username)
        if (`${groupId}` === process.env.TELEGRAM_GROUP_ID) {
          await ctx.telegram.sendMessage(groupId, msg, {
            parse_mode: 'MarkdownV2',
          })
        }
      })
    next()
  })
}
