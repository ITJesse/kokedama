import axios from 'axios'
import { Worker } from 'bullmq'
import { randomUUID } from 'crypto'
import fs from 'fs'
import { execFile } from 'mz/child_process'
import os from 'os'
import path from 'path'
import sharp from 'sharp'

import { signUrl, store, uploadBuf } from '@/utils/oss'

import { connection } from './queue'

const binaryPath =
  os.platform() === 'darwin'
    ? '/Users/jesse/Github/waifu2x-converter-cpp/build/waifu2x-converter-cpp'
    : 'waifu2x-converter-cpp'

new Worker(
  'waifu2x',
  async (job) => {
    const { imageUrl, scale } = job.data
    console.log('start waifu2x', imageUrl)
    const input = path.resolve('/tmp', randomUUID())
    const output = path.resolve('/tmp', `${randomUUID()}.png`)
    try {
      const { data } = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
      })
      fs.writeFileSync(input, Buffer.from(data))
    } catch (err) {
      return { success: false, message: '下载图片失败' }
    }

    const { width, height } = await sharp(input).metadata()
    console.log(width, height)
    if (!width || !height || width >= 4096 || height >= 4096) {
      return { success: false, message: '原图大小已经超过4K了' }
    }

    try {
      await execFile(binaryPath, [
        '--block-size',
        '256',
        '-m',
        'noise-scale',
        '--scale-ratio',
        `${scale ?? 2}`,
        '--noise-level 1',
        '-i',
        input,
        '-o',
        output,
      ])
      const imgBuf = await sharp(output)
        .resize(4096, 4096, {
          fit: sharp.fit.inside,
        })
        .toFormat('jpg', { quality: 95 })
        .toBuffer()
      const fileKey = await uploadBuf('', imgBuf, 'waifu2x/')

      fs.unlinkSync(input)
      fs.unlinkSync(output)

      console.log('done waifu2x', imageUrl)
      return { success: true, url: store.generateObjectUrl(fileKey) }
    } catch (err) {
      return { success: false, message: err }
    }
  },
  { concurrency: 2, connection },
)
