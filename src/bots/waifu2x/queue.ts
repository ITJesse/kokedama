import { Queue, QueueEvents } from 'bullmq'

export const connection = {
  host: process.env.REDIS_HOST ?? '127.0.0.1',
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
  db: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB) : 0,
}
export const waifuQueue = new Queue('waifu2x', { connection })
export const queueEvents = new QueueEvents('waifu2x', {
  connection,
})
