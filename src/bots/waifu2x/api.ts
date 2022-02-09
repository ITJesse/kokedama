import { Router } from 'express'
import { pipe } from 'fp-ts/lib/function'
import * as io from 'io-ts'
import { v4 as uuidV4 } from 'uuid'

import { E, TE } from '@/lib/fp'
import { EXHENTAI_API_TASK_PREFIX, EXHENTAI_DOWNLOADS } from '@/utils/consts'
import redis from '@/utils/redis'

import { waifuQueue } from './queue'

const router = Router()

const NewTaskQueryDecoder = io.type({
  imageUrl: io.string,
})

router.post('/new_task', async (req, res) => {
  const query = await pipe(
    NewTaskQueryDecoder.decode(req.body),
    TE.fromEither,
  )()
  if (E.isLeft(query)) {
    return res.status(400).json({ success: false, message: 'bad input' })
  }
  const { imageUrl } = query.right

  const job = await waifuQueue.add(
    'waifu2x_image',
    { imageUrl },
    { removeOnComplete: 3000, removeOnFail: 3000 },
  )
  res.json({ success: true, taskId: job.id })
})

const GetTaskQueryDecoder = io.type({
  taskId: io.string,
})
router.get('/:taskId', async (req, res) => {
  const query = await pipe(
    GetTaskQueryDecoder.decode(req.params),
    TE.fromEither,
  )()
  if (E.isLeft(query)) {
    return res.status(400).json({ success: false, message: 'bad input' })
  }
  const { taskId } = query.right

  let task: DownloadTaskPayload | null = null
  try {
    task = JSON.parse(
      (await redis.GET(`${EXHENTAI_API_TASK_PREFIX}${taskId}`)) ?? '',
    )
  } catch {}
  if (!task) {
    return res.status(404).json({ success: false, message: 'task not found' })
  }

  res.json({ success: true, data: task })
})

export default router
