import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { Telegraf } from 'telegraf'
import { InlineKeyboardMarkup } from 'typegram'

import * as redis from './redis'
import { getOrigImgUrl, getTweetById, getTweetUrl, getUserUrl } from './twitter'

const welcom = fs
  .readFileSync(path.resolve(__dirname, '../templates/welcome.txt'))
  .toString()

const bot = new Telegraf(process.env.BOT_TOKEN ?? '')

const GROUP_MEMBER_PREFIX = 'TELEGRAM_GROUP_MEMBERS_'

bot.use(async (_, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  console.log('Response time: %sms', ms)
})

bot.command('info', (ctx) => {
  const groupId = ctx.chat?.id
  if (!groupId) {
    return
  }

  const from = ctx.update.message?.from
  const msg = `Group ID: ${groupId}\nUser ID: ${from?.id}`
  ctx.telegram.sendMessage(groupId, msg)
})

bot.on('new_chat_members', (ctx) => {
  const groupId = ctx.chat?.id
  if (!groupId || groupId !== parseInt(process.env.TELEGRAM_GROUP_ID ?? '')) {
    return
  }

  ctx.message?.new_chat_members
    ?.filter((m) => !m.is_bot)
    .forEach(async (m) => {
      const username = m.username
        ? `@${m.username.replace(/_/g, '\\_')}`
        : `[${m.last_name} ${m.first_name}](tg://user?id=${m.id})`
      const msg = welcom.replace('{username}', username)
      ctx.telegram.sendMessage(groupId, msg, { parse_mode: 'MarkdownV2' })
      await redis.hset([
        `${GROUP_MEMBER_PREFIX}${groupId}`,
        `${m.id}`,
        `${Date.now()}`,
      ])
    })
})

bot.on('left_chat_member', async (ctx) => {
  const groupId = ctx.update.message?.chat.id
  if (!groupId || groupId !== parseInt(process.env.TELEGRAM_GROUP_ID ?? '')) {
    return
  }

  const fromId = ctx.update.message?.left_chat_member?.id
  if (!fromId || ctx.update.message?.left_chat_member?.is_bot) {
    return
  }
  await redis.hdel([`${GROUP_MEMBER_PREFIX}${groupId}`, `${fromId}`])
})

bot.on('text', async (ctx) => {
  const text = ctx.update.message.text
  if (text && /https:\/\/twitter\.com\/(\w+)\/status\/(\d+)/.test(text)) {
    const result = text.match(/https:\/\/twitter\.com\/(\w+)\/status\/(\d+)/)
    if (result) {
      const tweetId = result[2]
      // const tweet = await getTweetById(tweetId)
      const msg = await ctx.reply('发现 Twitter 链接，请选择操作：', {
        reply_to_message_id: ctx.update.message?.message_id,
        parse_mode: 'MarkdownV2',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '显示预览',
                callback_data: `preview_tweet|${tweetId}`,
              },
              {
                text: '下载原图',
                callback_data: `download_tweet_all|${tweetId}`,
              },
            ],
          ],
        },
      })
      setTimeout(async () => {
        try {
          await ctx.tg.deleteMessage(msg.chat.id, msg.message_id)
        } catch {}
      }, 30000)
    }
  }

  const groupId = ctx.message.chat.id
  // 标记活跃用户
  if (!groupId || groupId !== parseInt(process.env.TELEGRAM_GROUP_ID ?? '')) {
    return
  }
  const fromId = ctx.update.message?.from?.id
  if (!fromId) {
    return
  }
  await redis.hset([
    `${GROUP_MEMBER_PREFIX}${groupId}`,
    `${fromId}`,
    `${Date.now()}`,
  ])
})

bot.on('callback_query', async (ctx) => {
  const groupId = ctx.update.callback_query?.message?.chat.id
  if (!('data' in ctx.update.callback_query)) {
    return
  }
  const data = ctx.update.callback_query.data
  if (!data || !groupId) {
    return
  }
  const cmd = data.split('|')[0]
  const params = data.split('|')[1]?.split(',')
  switch (cmd) {
    case 'cancel_and_remove': {
      try {
        ctx.tg.deleteMessage(
          groupId,
          ctx.update.callback_query?.message?.message_id ?? 0,
        )
      } catch {}
      break
    }
    case 'remove_message': {
      try {
        await ctx.tg.deleteMessage(groupId, parseInt(params[0]))
      } catch {}
      break
    }
    case 'preview_tweet': {
      const tweetId = params[0]
      const tweet = await getTweetById(tweetId)
      const images = tweet.includes.media?.map(
        (e: any) => e.url ?? e.preview_image_url,
      )
      const content = `${tweet.data.text}`
      const inlineKeyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
          [
            {
              text: `作者：${tweet.includes.users[0].name}`,
              url: getUserUrl(tweet.includes.users[0].username),
            },
            {
              text: '原文链接',
              url: getTweetUrl(tweet.includes.users[0].username, tweetId),
            },
          ],
        ],
      }
      if (!images) {
        ctx.tg.sendMessage(groupId, content, {
          parse_mode: 'HTML',
          disable_web_page_preview: true,
          reply_markup: inlineKeyboard,
          disable_notification: true,
        })
      } else {
        const { data } = await axios.get(images[0], {
          responseType: 'arraybuffer',
        })
        ctx.tg.sendPhoto(
          groupId,
          { source: Buffer.from(data) },
          {
            caption: content,
            parse_mode: 'HTML',
            disable_notification: true,
            reply_to_message_id: parseInt(params[1]),
            reply_markup: {
              inline_keyboard: [
                [
                  ...(images.length > 1
                    ? [
                        {
                          text: `全部预览（共${images.length}张）`,
                          callback_data: `preview_tweet_all|${tweetId},${params[1]}`,
                        },
                      ]
                    : []),
                  {
                    text: `下载原图（共${images.length}张）`,
                    callback_data: `download_tweet_all|${tweetId},${params[1]}`,
                  },
                ],
                ...inlineKeyboard.inline_keyboard,
              ],
            },
          },
        )
      }
      break
    }
    case 'preview_tweet_all': {
      const tweetId = params[0]
      const tweet = await getTweetById(tweetId)
      const images = tweet.includes.media?.map((e: any) => e.url)
      if (!images) {
        return
      } else {
        const imageBufs: Buffer[] = await Promise.all(
          images.map((e: any) =>
            axios
              .get(e, { responseType: 'arraybuffer' })
              .then(({ data }) => Buffer.from(data)),
          ),
        )
        ctx.tg.sendMediaGroup(
          groupId,
          imageBufs.map((e) => ({
            type: 'photo',
            media: { source: e },
          })),
          {
            disable_notification: true,
          },
        )
      }
      break
    }
    case 'download_tweet_all': {
      const tweetId = params[0]
      const tweet = await getTweetById(tweetId)
      const images = tweet.includes.media?.map((e: any) => getOrigImgUrl(e.url))
      if (!images) {
        return
      } else {
        const imageBufs: Buffer[] = await Promise.all(
          images.map((e: any) =>
            axios
              .get(e, { responseType: 'arraybuffer' })
              .then(({ data }) => Buffer.from(data)),
          ),
        )
        ctx.tg.sendMediaGroup(
          groupId,
          imageBufs.map((e, i) => ({
            type: 'document',
            media: { filename: `${tweetId}_${i + 1}.jpg`, source: e },
          })),
          {
            disable_notification: true,
          },
        )
      }
      break
    }
  }
})

bot.launch()
console.log('Bot started.')

// Enable graceful stop
const stop = async () => {
  await bot.stop()
  process.exit()
}
process.once('SIGINT', stop)
process.once('SIGTERM', stop)
