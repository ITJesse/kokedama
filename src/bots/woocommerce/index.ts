import { Telegraf } from 'telegraf'

import wooApi from '@/lib/woocommerce'

export function exhentaiBot(bot: Telegraf) {
  bot.on('callback_query', async (ctx, next) => {
    const groupId = ctx.update.callback_query.message?.chat.id
    const msgId = ctx.update.callback_query.message?.message_id
    if (!('data' in ctx.update.callback_query)) {
      return next()
    }
    const data = ctx.update.callback_query.data
    if (!data || !groupId) {
      return next()
    }
    const cmd = data.split('|')[0]
    const params = data.split('|')[1]?.split(',')
    console.log(cmd, params)

    switch (cmd) {
      case 'woocommerce_confirm_order': {
        const orderId = params[0]
        const { data } = await wooApi.put(`orders/${orderId}`, {
          status: 'completed',
        })
        console.log(data)
        if (msgId) {
          await ctx.deleteMessage(msgId)
        }
        break
      }
    }
    next()
  })
}
