import { Telegraf } from 'telegraf'
import { task as exhentaiTask } from './bots/exhentai'

export default async function scheduler(bot: Telegraf) {
  setInterval(async () => {
    await exhentaiTask(bot)
  }, 5000)
}
