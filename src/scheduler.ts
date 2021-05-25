import { Telegraf } from 'telegraf'

import { task as exhentaiTask } from './bots/exhentai'
import { task as twitterTask } from './bots/twitter'

export default async function scheduler(bot: Telegraf) {
  setInterval(async () => {
    await exhentaiTask(bot)
  }, 5000)

  await twitterTask(bot)
}
