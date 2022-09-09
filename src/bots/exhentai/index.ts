import fs from 'fs'
import path from 'path'
import { Markup, Telegraf } from 'telegraf'

import { EXHENTAI_API_TASK_PREFIX, EXHENTAI_DOWNLOADS } from '@/utils/consts'
import redis from '@/utils/redis'
import { create7Zip } from '@/utils/zip'

import {
    galleryArchiveTemplate, galleryDoneTemplate, galleryDownloadTemplate, galleryMetaTemplate
} from './templates'
import { DownloadTaskPayload, DownloadTaskStatus } from './types'
import { exhentaiApi, fmtFolderName, galleryUrl, getGalleryMeta, getGalleryToken } from './utils'

const galleryUrlRegex = /https:\/\/e(x|-)hentai\.org\/g\/(\d+)\/([a-f0-9]+)/i
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
          if (msgId) {
            await ctx.tg.deleteMessage(groupId, msgId)
          }
        } catch {}

        await redis.hset(
          EXHENTAI_DOWNLOADS,
          `${gid}`,
          JSON.stringify({ groupId, msgId: msg.message_id, meta }),
        )
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
    const { meta, groupId, msgId, taskId }: DownloadTaskPayload = JSON.parse(
      tasks[gid],
    )
    const title = meta.title_jpn ? meta.title_jpn : meta.title
    const folderName = fmtFolderName(title, gid)
    const folderPath = path.join(
      process.env.EXHENTAI_DOWNLOAD_PATH ?? '',
      folderName,
    )
    if (!fs.existsSync(folderPath)) {
      continue
    }
    const list = fs.readdirSync(folderPath)

    if (list.includes('galleryinfo.txt')) {
      await redis.hdel(EXHENTAI_DOWNLOADS, `${gid}`)
      if (groupId && msgId) {
        await bot.telegram.editMessageText(
          groupId,
          msgId,
          undefined,
          galleryArchiveTemplate(title),
          { parse_mode: 'HTML' },
        )
      }
      if (taskId) {
        const taskInfo: DownloadTaskStatus = {
          status: 'archiving',
          data: {},
        }
        await redis.setex(
          `${EXHENTAI_API_TASK_PREFIX}${taskId}`,
          3600,
          JSON.stringify(taskInfo),
        )
      }
      const filepath = path.join(`${gid}`, meta.token, 'archive.7z')
      const nfsFilePath = path.resolve(
        process.env.EXHENTAI_NFS_PATH ?? '',
        filepath,
      )
      await fs.mkdirSync(nfsFilePath.split('/').slice(0, -1).join('/'), {
        recursive: true,
      })
      const { filesize } = await create7Zip(nfsFilePath, folderPath)
      if (groupId && msgId) {
        await bot.telegram.deleteMessage(groupId, msgId)
        await bot.telegram.sendMessage(
          groupId,
          galleryDoneTemplate(title, filesize),
          {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
            reply_markup: Markup.inlineKeyboard([
              Markup.button.url(
                '下载',
                `${process.env.EXHENTAI_NFS_BASEURL}/${filepath}`,
              ),
            ]).reply_markup,
          },
        )
      }
      if (taskId) {
        const taskInfo: DownloadTaskStatus = {
          status: 'done',
          data: {
            url: `${process.env.EXHENTAI_SHORTEN_BASEURL}/${gid}/${meta.token}`,
          },
        }
        await redis.setex(
          `${EXHENTAI_API_TASK_PREFIX}${taskId}`,
          3600,
          JSON.stringify(taskInfo),
        )
      }
    } else {
      const count = Math.max(list.length - 1, 0)
      if (groupId && msgId) {
        await bot.telegram.editMessageText(
          groupId,
          msgId,
          undefined,
          galleryDownloadTemplate(title, count, parseInt(meta.filecount)),
          { parse_mode: 'HTML' },
        )
      }
      if (taskId) {
        const taskInfo: DownloadTaskStatus = {
          status: 'downloading',
          data: {
            total: parseInt(meta.filecount),
            current: count,
          },
        }
        await redis.setex(
          `${EXHENTAI_API_TASK_PREFIX}${taskId}`,
          3600,
          JSON.stringify(taskInfo),
        )
      }
    }
  }
}
