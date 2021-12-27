import { commandOptions } from 'redis'
import { Telegraf } from 'telegraf'

import redis from '@/utils/redis'

export class MsgQueue<Message> {
  protected bot: Telegraf
  protected queue = 'TEST_QUEUE'
  protected client

  constructor(bot: Telegraf) {
    this.bot = bot
    this.client = redis.duplicate()
    this.client.connect()
  }

  public addMessage(msg: Message) {
    throw new Error('not implemented')
  }

  protected async sendMessage(msg: Message) {
    throw new Error('not implemented')
  }

  public start() {
    const send = async () => {
      try {
        const res = await this.client.BLPOP(
          commandOptions({ isolated: true }),
          this.queue,
          0,
        )
        if (res?.element) {
          const msg = JSON.parse(res?.element)
          await this.sendMessage(msg)
        }
      } catch (err) {
        console.error(err)
      }
      send()
    }
    send()
  }
}
