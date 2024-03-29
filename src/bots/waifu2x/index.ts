import crypto from 'crypto'
import { Telegraf } from 'telegraf'
import { Message } from 'telegraf/typings/core/types/typegram'

import { queueEvents, waifuQueue } from './queue'

export function waifuBot(bot: Telegraf) {
  bot.command('waifu2x', async (ctx) => {
    const messageId = ctx.update.message.message_id
    const chatId = ctx.update.message.chat.id
    const replyToMsg = ctx.update.message.reply_to_message
    let imageUrl: string
    if ((replyToMsg as any)?.photo) {
      imageUrl = (
        await bot.telegram.getFileLink(
          (replyToMsg as Message.PhotoMessage).photo.sort(
            (a, b) => b.width * b.height - a.width * a.height,
          )[0].file_id,
        )
      ).href
    } else if (
      (replyToMsg as any)?.document &&
      (replyToMsg as any)?.document.mime_type.startsWith('image/')
    ) {
      imageUrl = (
        await bot.telegram.getFileLink(
          (replyToMsg as Message.DocumentMessage).document.file_id,
        )
      ).href
    } else {
      const replyMsg = await bot.telegram.sendMessage(
        chatId,
        '请回复到一张图片',
        {
          reply_to_message_id: messageId,
          allow_sending_without_reply: true,
        },
      )
      setTimeout(() => {
        bot.telegram.deleteMessage(chatId, messageId)
        bot.telegram.deleteMessage(chatId, replyMsg.message_id)
      }, 10000)
      return
    }

    const jobId = crypto.createHash('md5').update(imageUrl).digest('hex')
    const job = await waifuQueue.add(
      'waifu2x_image',
      { imageUrl },
      {
        removeOnComplete: 10000,
        removeOnFail: { age: 15 * 1000 },
        jobId,
        attempts: 1,
      },
    )
    const processingMsg = await bot.telegram.sendMessage(chatId, '处理中...', {
      reply_to_message_id: messageId,
      allow_sending_without_reply: true,
    })
    try {
      const { success, message, url } = await job.waitUntilFinished(
        queueEvents,
        300000,
      )
      if (!success) {
        await bot.telegram.sendMessage(chatId, message, {
          reply_to_message_id: messageId,
          allow_sending_without_reply: true,
        })
        return
      }
      await bot.telegram.sendDocument(chatId, url, {
        reply_to_message_id: messageId,
        allow_sending_without_reply: true,
      })
    } catch (err) {
      await bot.telegram.sendMessage(chatId, `${err}`)
    } finally {
      await bot.telegram.deleteMessage(chatId, processingMsg.message_id)
    }
  })
}
