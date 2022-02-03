import axios from 'axios'
import { randomUUID } from 'crypto'
import fs from 'fs'
import { execFile } from 'mz/child_process'
import path from 'path'
import { Telegraf } from 'telegraf'
import { Message } from 'telegraf/typings/core/types/typegram'

export function waifuBot(bot: Telegraf) {
  bot.command('waifu2x', async (ctx) => {
    const messageId = ctx.update.message.message_id
    const chatId = ctx.update.message.chat.id
    const replyToMsg = ctx.update.message.reply_to_message
    if (!(replyToMsg as any)?.photo) {
      const replyMsg = await bot.telegram.sendMessage(
        chatId,
        '请回复到一张图片',
        {
          reply_to_message_id: messageId,
        },
      )
      setTimeout(() => {
        bot.telegram.deleteMessage(chatId, messageId)
        bot.telegram.deleteMessage(chatId, replyMsg.message_id)
      }, 10000)
      return
    }
    const imageUrl = await bot.telegram.getFileLink(
      (replyToMsg as Message.PhotoMessage).photo.sort(
        (a, b) => b.width * b.height - a.width * a.height,
      )[0].file_id,
    )
    const { data } = await axios.get(imageUrl.href, {
      responseType: 'arraybuffer',
    })
    const input = path.resolve('/tmp', randomUUID())
    const output = path.resolve('/tmp', `${randomUUID()}.png`)
    fs.writeFileSync(input, Buffer.from(data))
    const processingMsg = await bot.telegram.sendMessage(chatId, '处理中...', {
      reply_to_message_id: messageId,
    })
    try {
      await execFile('waifu2x-converter-cpp', [
        '--block-size',
        '512',
        '-m',
        'noise-scale',
        '--scale-ratio',
        '2',
        '--noise-level 0',
        '-i',
        input,
        '-o',
        output,
      ])
      await bot.telegram.sendDocument(
        chatId,
        {
          source: output,
        },
        {
          reply_to_message_id: messageId,
        },
      )
    } catch (err) {
      await bot.telegram.sendMessage(chatId, `${err}`)
    } finally {
      await bot.telegram.deleteMessage(chatId, processingMsg.message_id)
    }
  })
}
