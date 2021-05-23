import { Telegraf } from 'telegraf'

export default function infoBot(bot: Telegraf) {
  bot.command('info', (ctx) => {
    console.log(ctx)
    const groupId = ctx.chat?.id
    if (!groupId) {
      return
    }

    const from = ctx.update.message?.from
    const msg = `Group ID: ${groupId}\nUser ID: ${from?.id}`
    ctx.telegram.sendMessage(groupId, msg)
  })
}
