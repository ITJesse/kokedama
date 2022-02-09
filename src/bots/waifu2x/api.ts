import { Router } from 'express'
import { pipe } from 'fp-ts/lib/function'
import * as io from 'io-ts'
import { crypto } from 'mz'

import { E, TE } from '@/lib/fp'

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
  const jobId = crypto.createHash('md5').update(imageUrl).digest('hex')

  const job = await waifuQueue.add(
    'waifu2x_image',
    { imageUrl },
    { removeOnComplete: 1000, removeOnFail: true, jobId, attempts: 1 },
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

  const job = await waifuQueue.getJob(taskId)
  if (!job)
    return res.status(404).json({ success: false, message: 'task not found' })

  const status = await job.getState()

  if (status === 'completed') {
    return res.json({ ...job.returnvalue, status })
  }
  return res.json({ success: true, status })
})

export default router
