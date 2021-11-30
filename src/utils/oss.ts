import OSS, { SignatureUrlOptions } from 'ali-oss'
import crypto from 'crypto'
import fileType from 'file-type'
import { ReadStream } from 'fs'
import ObjectID64 from 'objectid64'
import sharp from 'sharp'

const encoder = ObjectID64()

const createClient = () =>
  new OSS({
    // endpoint: 'oss-cn-guangzhou.aliyuncs.com',
    // endpoint: 'oss-accelerate.aliyuncs.com',
    accessKeyId: process.env.ALIYUN_OSS_KEY ?? '',
    accessKeySecret: process.env.ALIYUN_OSS_SECRET ?? '',
    bucket: process.env.ALIYUN_OSS_BUCKET,
    region: process.env.ALIYUN_OSS_REGION,
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

export const uploadBuf = async (
  origName: string,
  buf: Buffer,
  pre = '',
): Promise<string> => {
  const hash = encoder.encode(
    crypto.createHash('md5').update(buf).digest('hex'),
  )
  const fileKey = pre + hash.substr(0, 2) + '/' + hash.substr(2)

  try {
    await store.head(fileKey)
    return fileKey
  } catch {}

  const mime = await fileType.fromBuffer(buf)
  const meta = await sharp(buf).metadata()
  await store.put(fileKey, buf, {
    headers: {
      'Content-Type': mime?.mime,
      'x-oss-meta-filename': encodeURIComponent(origName),
      'x-oss-meta-width': meta.width,
      'x-oss-meta-height': meta.height,
    },
  })
  return fileKey
}

export const download = async (fileKey: string): Promise<Buffer> => {
  const { content } = await store.get(fileKey)
  return content
}

export const getUrl = (fileKey: string) => store.generateObjectUrl(fileKey)

export const signUrl = (
  fileKey: string,
  process?: SignatureUrlOptions['process'],
  expires?: number,
) => {
  const url = store.signatureUrl(fileKey, { process, expires })
  return url
}
