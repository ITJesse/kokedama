import { Router } from 'express'
import { Markup, Telegraf } from 'telegraf'

const WooCommerceRouter = (bot: Telegraf) => {
  const router = Router()

  router.post('/new_order', async (req, res) => {
    const { payment_method, total, currency, id } = req.body
    if (payment_method === 'codepay_wx') {
      bot.telegram.sendMessage(
        parseInt(process.env.TELEGRAM_GROUP_ID ?? ''),
        `<b>收到微信支付订单</b>
金额：${total} ${currency}
@ITJesse`,
        {
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.button.callback(
                '确认订单',
                `woocommerce_confirm_order|${id}`,
              ),
            ],
          ]).reply_markup,
        },
      )
    }
    res.send('ok')
  })

  return router
}

export default WooCommerceRouter
