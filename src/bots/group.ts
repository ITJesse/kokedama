import fs from 'fs'
import path from 'path'
import { Telegraf } from 'telegraf'

import { GROUP_MEMBER_PREFIX } from '@/utils/consts'
import * as redis from '@/utils/redis'

const welcom = fs
  .readFileSync(path.resolve(__dirname, '../../templates/welcome.txt'))
  .toString()

export function groupBot(bot: Telegraf) {
  // bot.on('text', async (ctx, next) => {
  //   const groupId = ctx.message.chat.id
  //   // 标记活跃用户
  //   if (!groupId) {
  //     return next()
  //   }
  //   const fromId = ctx.update.message?.from?.id
  //   if (!fromId) {
  //     return next()
  //   }
  //   await redis.hset([
  //     `${GROUP_MEMBER_PREFIX}${groupId}`,
  //     `${fromId}`,
  //     `${Date.now()}`,
  //   ])
  //   next()
  // })

  bot.on('new_chat_members', (ctx, next) => {
    const groupId = ctx.chat?.id
    if (!groupId) {
      return next()
    }

    ctx.message?.new_chat_members
      ?.filter((m) => !m.is_bot)
      .forEach(async (m) => {
        const username = m.username
          ? `@${m.username.replace(/_/g, '\\_')}`
          : `[${m.last_name} ${m.first_name}](tg://user?id=${m.id})`
        const msg = welcom.replace('{username}', username)
        if (`${groupId}` === process.env.TELEGRAM_GROUP_ID) {
          await ctx.telegram.sendMessage(groupId, msg, {
            parse_mode: 'MarkdownV2',
          })
        }
        // await redis.hset([
        //   `${GROUP_MEMBER_PREFIX}${groupId}`,
        //   `${m.id}`,
        //   `${Date.now()}`,
        // ])
      })
    next()
  })

  bot.on('left_chat_member', async (ctx, next) => {
    const groupId = ctx.update.message?.chat.id
    if (!groupId) {
      return next()
    }

    const fromId = ctx.update.message?.left_chat_member?.id
    if (!fromId || ctx.update.message?.left_chat_member?.is_bot) {
      return next()
    }
    // await redis.hdel([`${GROUP_MEMBER_PREFIX}${groupId}`, `${fromId}`])
    next()
  })

  bot.on('message', async (ctx, next) => {
    const userId = ctx.update.message.from.id
    if (userId === 777000) {
      console.log('delete', ctx.update.message.message_id)
      await ctx.deleteMessage(ctx.update.message.message_id)
      console.log('deleted')
    }
    next()
  })
}
