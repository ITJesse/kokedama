import axios from 'axios'
import gm, { ResizeOption } from 'gm'
import { Telegraf } from 'telegraf'

import { fileKeyExists, signUrl, uploadWithPath } from './oss'

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

export const getName = ({
  first_name,
  last_name,
  username,
}: {
  first_name: string
  last_name?: string
  username?: string
}) => {
  const name = [first_name, last_name].filter((e) => !!e).join(' ') ?? username
  return name
}

export const resizeImage = (
  image: Buffer,
  size: { width: number; height?: number; opt?: ResizeOption },
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    gm(image)
      .resize(size.width, size.height, size.opt)
      .units('undefined')
      .density(0, 0)
      .toBuffer('png', (err, buf) => {
        if (err) return reject(err)
        resolve(buf)
      })
  })
}

export const getProfilePhoto = async (bot: Telegraf, userId: number) => {
  let imageUrl = 'https://dummyimage.com/1x1/000/fff'
  const fileKey = `/profile/photo/${userId}_32.jpg`
  if (await fileKeyExists(fileKey)) {
    return signUrl(fileKey)
  }

  const { photos } = await bot.telegram.getUserProfilePhotos(userId, 0, 1)
  const profilePhoto = photos[0]?.sort(
    (a, b) => a.width * a.height - b.width * b.height,
  )[0].file_id
  if (profilePhoto) {
    const photoUrl = await bot.telegram.getFileLink(profilePhoto)
    const { data } = await axios.get(photoUrl.href, {
      responseType: 'arraybuffer',
    })
    const buf = await resizeImage(Buffer.from(data), { width: 32, height: 32 })
    await uploadWithPath(fileKey, buf)
    imageUrl = signUrl(fileKey)
  }
  return imageUrl
}
