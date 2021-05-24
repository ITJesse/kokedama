import axios from 'axios'
import fs from 'fs'
import path from 'path'

import { GalleryMetaResponse } from './types'

const tags = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, './data/tags.json')).toString(),
)

axios.defaults.baseURL = 'https://exhentai.org'
axios.defaults.headers = {
  Cookie: process.env.EXHENTAI_COOKIES,
}

export const getGalleryMeta = async (gid: number, gtoken: string) => {
  const { data } = await axios.post<GalleryMetaResponse>('/api.php', {
    method: 'gdata',
    gidlist: [[gid, gtoken]],
    namespace: 1,
  })
  return data.gmetadata[0]
}

export const translateTag = (tag: string, checkMisc = false): string[] => {
  const keys = tag.split(':')
  const text = []
  let data = tags.data
  let hasTranslate = false

  for (let i = 0; i <= 1; i += 1) {
    const key = keys[i]
    if (i === 0) {
      const translate = data.find((e: any) => e.namespace === key)
      if (!translate) {
        text.push(key)
        break
      }
      text.push(translate.frontMatters.name.split(' ').join('_'))
      data = translate.data
      hasTranslate = true
    } else {
      const translate = data[key]
      if (!translate) {
        text.push(key)
        break
      }
      text.push(translate.name.split(' ').join('_'))
      hasTranslate = true
    }
  }
  if (!hasTranslate && !checkMisc) {
    return translateTag(`misc:${tag}`, true)
  }
  return text
}

export const galleryUrl = (gid: number, gtoken: string, expunged = false) =>
  `https://e${expunged ? 'x' : '-'}hentai.org/g/${gid}/${gtoken}/`

export const tagUrl = (tag: string, expunged = false) =>
  `https://e${expunged ? 'x' : '-'}hhentai.org/tag/${tag.split(' ').join('+')}`
