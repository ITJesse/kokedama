import { Router } from 'express'
import { pipe } from 'fp-ts/lib/function'
import * as io from 'io-ts'
import { v4 as uuidV4 } from 'uuid'

import { E, TE } from '@/libs/fp'
import { EXHENTAI_API_TASK_PREFIX, EXHENTAI_DOWNLOADS } from '@/utils/consts'
import * as redis from '@/utils/redis'

import { DownloadTaskPayload, DownloadTaskStatus, GalleryMeta } from './types'
import { exhentaiApi, fmtMetaJson, getGalleryMeta, getGalleryToken } from './utils'

const router = Router()

const PreviewGalleryQueryDecoder = io.type({
  gid: io.number,
  gtoken: io.string,
})
router.post('/preview/by_gallery_link', async (req, res) => {
  const query = await pipe(
    PreviewGalleryQueryDecoder.decode(req.body),
    TE.fromEither,
  )()
  if (E.isLeft(query)) {
    return res.status(400).json({ success: false, message: 'bad input' })
  }
  const { gid, gtoken } = query.right
  const meta = await getGalleryMeta(gid, gtoken)
  const { data: thumbnail } = await exhentaiApi.get(meta.thumb, {
    responseType: 'arraybuffer',
  })

  res.json({
    success: true,
    data: fmtMetaJson(meta),
    thumbnail: Buffer.from(thumbnail).toString('base64'),
  })
})

const PreviewPageQueryDecoder = io.type({
  gid: io.number,
  ptoken: io.string,
  page: io.number,
})
router.post('/preview/by_page_link', async (req, res) => {
  const query = await pipe(
    PreviewPageQueryDecoder.decode(req.body),
    TE.fromEither,
  )()
  if (E.isLeft(query)) {
    return res.status(400).json({ success: false, message: 'bad input' })
  }
  const { gid, ptoken, page } = query.right
  const { token } = await getGalleryToken(gid, ptoken, page)
  const meta = await getGalleryMeta(gid, token)
  const { data: thumbnail } = await exhentaiApi.get(meta.thumb, {
    responseType: 'arraybuffer',
  })
  res.json({
    success: true,
    data: fmtMetaJson(meta),
    gtoken: token,
    thumbnail: Buffer.from(thumbnail).toString('base64'),
  })
})

router.post('/download', async (req, res) => {
  const query = await pipe(
    PreviewGalleryQueryDecoder.decode(req.body),
    TE.fromEither,
  )()
  if (E.isLeft(query)) {
    return res.status(400).json({ success: false, message: 'bad input' })
  }
  const { gid, gtoken } = query.right
  const meta = await getGalleryMeta(gid, gtoken)
  const url = `https://exhentai.org/archiver.php?gid=${gid}&token=${gtoken}&or=${meta.archiver_key}`
  await exhentaiApi.post(url, 'hathdl_xres=org', {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })

  let task: DownloadTaskPayload | null = null
  try {
    task = JSON.parse(await redis.hget(EXHENTAI_DOWNLOADS, `${gid}`))
  } catch {}

  if (task && task.taskId) {
    return res.json({ success: true, taskId: task.taskId })
  }

  const taskId = uuidV4()
  await redis.hset([
    EXHENTAI_DOWNLOADS,
    `${gid}`,
    JSON.stringify({ meta, taskId }),
  ])

  const status: DownloadTaskStatus = {
    status: 'downloading',
    data: {
      total: parseInt(meta.filecount),
      current: 0,
    },
  }
  await redis.setex(
    `${EXHENTAI_API_TASK_PREFIX}${taskId}`,
    3600,
    JSON.stringify(status),
  )

  res.json({ success: true, taskId })
})

const DownloadGalleryQueryDecoder = io.type({
  taskId: io.string,
})
router.get('/download/:taskId', async (req, res) => {
  const query = await pipe(
    DownloadGalleryQueryDecoder.decode(req.params),
    TE.fromEither,
  )()
  if (E.isLeft(query)) {
    return res.status(400).json({ success: false, message: 'bad input' })
  }
  const { taskId } = query.right

  let task: DownloadTaskPayload | null = null
  try {
    task = JSON.parse(
      (await redis.get(`${EXHENTAI_API_TASK_PREFIX}${taskId}`)) ?? '',
    )
  } catch {}
  if (!task) {
    return res.status(404).json({ success: false, message: 'task not found' })
  }

  res.json({ success: true, data: task })
})

export default router
