import { Telegraf } from 'telegraf'

import { task as exhentaiTask } from './bots/exhentai'

export default async function scheduler(bot: Telegraf) {
  setInterval(async () => {
    try {
      await exhentaiTask(bot)
    } catch (err) {
      console.error(err)
    }
  }, 5000)
}
