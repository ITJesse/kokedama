import { Telegraf } from 'telegraf'

import { delay } from '@/utils'

export class MsgQueue<Message> {
  protected bot: Telegraf
  protected queue: Message[] = []

  constructor(bot: Telegraf) {
    this.bot = bot
  }

  public addMessage(msg: Message) {
    throw new Error('not implemented')
  }

  protected async sendMessage(msg: Message) {
    throw new Error('not implemented')
  }

  public start() {
    const send = async () => {
      const msg = this.queue.shift()
      if (msg) {
        try {
          await this.sendMessage(msg)
        } catch (err) {
          console.error(err)
        }
      }
      await delay(100)
      send()
    }
    send()
  }
}
