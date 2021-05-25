import OSS from 'ali-oss'
import { ReadStream } from 'fs'

const createClient = () =>
  new OSS({
    // endpoint: 'oss-cn-guangzhou.aliyuncs.com',
    endpoint: 'oss-accelerate.aliyuncs.com',
    accessKeyId: process.env.ALIYUN_OSS_KEY ?? '',
    accessKeySecret: process.env.ALIYUN_OSS_SECRET ?? '',
    bucket: process.env.ALIYUN_OSS_BUCKET,
    region: 'oss-cn-guangzhou',
    secure: true,
  })

export const store = createClient()

export const upload = async (
  fileKey: string,
  stream: ReadStream,
): Promise<string> => {
  try {
    await store.head(fileKey)
    return fileKey
  } catch {}

  await store.putStream(fileKey, stream, { timeout: 240000 } as unknown as any)
  return fileKey
}

export const download = async (fileKey: string): Promise<Buffer> => {
  const { content } = await store.get(fileKey)
  return content
}

export const getUrl = (fileKey: string) => store.generateObjectUrl(fileKey)
