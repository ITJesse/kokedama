import { Queue, QueueEvents, RedisConnection } from 'bullmq'
import { Telegraf } from 'telegraf'

export const connection = {
  host: 'localhost',
  port: 6379,
}
export const waifuQueue = new Queue('waifu2x', { connection })
export const queueEvents = new QueueEvents('waifu2x', {
  connection,
})

export const handleQueneEvent = (bot: Telegraf) => {
  queueEvents.on('completed', async ({ jobId }) => {
    const job = await waifuQueue.getJob(jobId)
    if (!job) return
    const { processingMsgId, messageId, chatId } = job.data
    if (!chatId || !processingMsgId || !messageId) return
    await bot.telegram.deleteMessage(chatId, processingMsgId)

    const { success, message, url } = job.returnvalue
    if (!success) {
      await bot.telegram.sendMessage(chatId, message)
    }
    await bot.telegram.sendDocument(chatId, url, {
      reply_to_message_id: messageId,
    })
  })
  queueEvents.on('failed', async ({ jobId, failedReason }) => {
    const job = await waifuQueue.getJob(jobId)
    if (!job) return
    const { processingMsgId, messageId, chatId } = job.data
    if (!chatId || !processingMsgId || !messageId) return
    await bot.telegram.deleteMessage(chatId, processingMsgId)
    await bot.telegram.sendMessage(chatId, failedReason, {
      reply_to_message_id: messageId,
    })
  })
}
