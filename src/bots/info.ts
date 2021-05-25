import { Telegraf } from 'telegraf'

export function infoBot(bot: Telegraf) {
  bot.command('info', (ctx) => {
    const groupId = ctx.chat?.id
    if (!groupId) {
      return
    }

    const from = ctx.update.message?.from
    const msg = `Group ID: ${groupId}\nUser ID: ${from?.id}`
    ctx.tg.sendMessage(groupId, msg, {
      reply_to_message_id: ctx.update.message.message_id,
    })
  })
}
