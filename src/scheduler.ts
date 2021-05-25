import { Telegraf } from 'telegraf'

import { task as exhentaiTask } from './bots/exhentai'
import { task as twitterTask } from './bots/twitter'

export default async function scheduler(bot: Telegraf) {
  setInterval(async () => {
    try {
      await exhentaiTask(bot)
    } catch (err) {
      console.error(err)
    }
  }, 5000)

  setInterval(async () => {
    try {
      await twitterTask(bot)
    } catch (err) {
      console.error(err)
    }
  }, 30000)
}
