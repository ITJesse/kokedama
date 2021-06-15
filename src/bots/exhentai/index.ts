import fs from 'fs'
import path from 'path'
import { Markup, Telegraf } from 'telegraf'

import { EXHENTAI_DOWNLOADS } from '@/utils/consts'
import { getUrl, upload } from '@/utils/oss'
import * as redis from '@/utils/redis'
import { create7Zip } from '@/utils/zip'

import {
  galleryArchiveTemplate,
  galleryDoneTemplate,
  galleryDownloadTemplate,
  galleryMetaTemplate,
  galleryUploadTemplate,
} from './templates'
import { DownloadTaskPayload } from './types'
import {
  exhentaiApi,
  galleryUrl,
  getGalleryMeta,
  getGalleryToken,
} from './utils'

const galleryUrlRegex = /https:\/\/e(x|-)hentai\.org\/g\/(\d+)\/([a-f0-9]+)\//i
const galleryPageUrlRegex =
  /https:\/\/e(x|-)hentai\.org\/s\/([a-f0-9]+)\/(\d+)-(\d+)/i

export function exhentaiBot(bot: Telegraf) {
  bot.hears([galleryUrlRegex, galleryPageUrlRegex], async (ctx, next) => {
    let gid: number
    let gtoken: string

    if (ctx.match[0].includes('/g/')) {
      gid = parseInt(ctx.match[2])
      gtoken = ctx.match[3]
    } else {
      gid = parseInt(ctx.match[3])
      const ptoken = ctx.match[2]
      const page = parseInt(ctx.match[4])
      const { token } = await getGalleryToken(gid, ptoken, page)
      gtoken = token
    }

    const meta = await getGalleryMeta(gid, gtoken)
    const { data: thumbnail } = await exhentaiApi.get(meta.thumb, {
      responseType: 'arraybuffer',
    })

    const content = galleryMetaTemplate(meta)

    await ctx.tg.sendPhoto(
      ctx.update.message.chat.id,
      { source: Buffer.from(thumbnail) },
      {
        caption: content,
        parse_mode: 'HTML',
        disable_notification: true,
        reply_to_message_id: ctx.update.message.message_id,
        reply_markup: Markup.inlineKeyboard([
          [
            Markup.button.callback(
              '打包下载',
              `exhentai_download|${gid},${gtoken}`,
            ),
            Markup.button.url(
              '原文链接',
              galleryUrl(gid, gtoken, meta.expunged),
            ),
          ],
        ]).reply_markup,
      },
    )
    next()
  })

  bot.on('callback_query', async (ctx, next) => {
    const groupId = ctx.update.callback_query.message?.chat.id
    if (!('data' in ctx.update.callback_query)) {
      return next()
    }
    const data = ctx.update.callback_query.data
    if (!data || !groupId) {
      return next()
    }
    const cmd = data.split('|')[0]
    const params = data.split('|')[1]?.split(',')

    switch (cmd) {
      case 'exhentai_download': {
        const [gid, gtoken] = params
        const meta = await getGalleryMeta(parseInt(gid), gtoken)
        const url = `https://exhentai.org/archiver.php?gid=${gid}&token=${gtoken}&or=${meta.archiver_key}`
        await exhentaiApi.post(url, 'hathdl_xres=org', {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
        const msg = await ctx.tg.sendMessage(
          groupId,
          galleryDownloadTemplate(
            meta.title_jpn ? meta.title_jpn : meta.title,
            0,
            parseInt(meta.filecount),
          ),
          {
            parse_mode: 'HTML',
            disable_notification: true,
          },
        )
        const task = await redis.hget(EXHENTAI_DOWNLOADS, `${gid}`)
        try {
          const data: DownloadTaskPayload = JSON.parse(task ?? '')
          const { msgId } = data
          await ctx.tg.deleteMessage(groupId, msgId)
        } catch {}

        await redis.hset([
          EXHENTAI_DOWNLOADS,
          `${gid}`,
          JSON.stringify({ groupId, msgId: msg.message_id, meta }),
        ])
        break
      }
    }
    next()
  })
}

export const task = async (bot: Telegraf) => {
  const tasks = await redis.hgetall(EXHENTAI_DOWNLOADS)
  const gids = Object.keys(tasks ?? {}).map((key) => parseInt(key))

  for (const gid of gids) {
    const data: DownloadTaskPayload = JSON.parse(tasks[gid])
    const title = data.meta.title_jpn ? data.meta.title_jpn : data.meta.title
    const folderName = `${title} [${gid}]`
      .replace(/\//g, '')
      .replace(/\|/g, '')
      .replace(/&#039;/g, "'")
      .replace(/  /g, ' ')
    const folderPath = path.join(
      process.env.EXHENTAI_DOWNLOAD_PATH ?? '',
      folderName,
    )
    if (!fs.existsSync(folderPath)) {
      continue
    }
    const list = fs.readdirSync(folderPath)

    if (list.includes('galleryinfo.txt')) {
      await redis.hdel([EXHENTAI_DOWNLOADS, `${gid}`])
      await bot.telegram.editMessageText(
        data.groupId,
        data.msgId,
        undefined,
        galleryArchiveTemplate(title),
        { parse_mode: 'HTML' },
      )
      const filepath = path.join(`${gid}`, data.meta.token, 'archive.7z')
      const { output, filesize } = await create7Zip(filepath, folderPath)
      await bot.telegram.editMessageText(
        data.groupId,
        data.msgId,
        undefined,
        galleryUploadTemplate(title),
        { parse_mode: 'HTML' },
      )
      await upload(filepath, fs.createReadStream(output, { flags: 'r' }))
      await bot.telegram.deleteMessage(data.groupId, data.msgId)
      await bot.telegram.sendMessage(
        data.groupId,
        galleryDoneTemplate(title, filesize),
        {
          parse_mode: 'HTML',
          disable_web_page_preview: true,
          reply_markup: Markup.inlineKeyboard([
            Markup.button.url('下载', getUrl(filepath)),
          ]).reply_markup,
        },
      )
    } else {
      const count = list.length - 1
      await bot.telegram.editMessageText(
        data.groupId,
        data.msgId,
        undefined,
        galleryDownloadTemplate(title, count, parseInt(data.meta.filecount)),
        { parse_mode: 'HTML' },
      )
    }
  }
}
