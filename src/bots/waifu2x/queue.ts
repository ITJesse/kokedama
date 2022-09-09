import { Queue, QueueEvents } from 'bullmq'

export const connection = {
  host: 'localhost',
  port: 6379,
}
export const waifuQueue = new Queue('waifu2x', { connection })
export const queueEvents = new QueueEvents('waifu2x', {
  connection,
})
