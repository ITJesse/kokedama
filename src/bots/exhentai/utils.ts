import axios from 'axios'
import emojiRegexRGI from 'emoji-regex'
import fs from 'fs'
import path from 'path'

import { GalleryMeta, GalleryMetaResponse, GalleryTokenResponse } from './types'

export const exhentaiApi = axios.create({
  headers: {
    Cookie: process.env.EXHENTAI_COOKIES,
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_3_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36',
  },
})

const tags = JSON.parse(
  fs
    .readFileSync(path.resolve(__dirname, '../../../data/tags.json'))
    .toString(),
)

export const getGalleryMeta = async (gid: number, gtoken: string) => {
  const { data } = await exhentaiApi.post<GalleryMetaResponse>(
    'https://exhentai.org/api.php',
    {
      method: 'gdata',
      gidlist: [[gid, gtoken]],
      namespace: 1,
    },
  )
  return data.gmetadata[0]
}

export const getGalleryToken = async (
  gid: number,
  ptoken: string,
  page: number,
) => {
  const { data } = await exhentaiApi.post<GalleryTokenResponse>(
    'https://exhentai.org/api.php',
    {
      method: 'gtoken',
      pagelist: [[gid, ptoken, page]],
      namespace: 1,
    },
  )
  return data.tokenlist[0]
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
      text.push(
        translate.name.replace(emojiRegexRGI(), '').split(' ').join('_'),
      )
      hasTranslate = true
    }
  }
  if (!hasTranslate && !checkMisc) {
    return translateTag(`misc:${tag}`, true)
  }
  return text
}

export const translateCategory = (category: string): string => {
  const translate = tags.data.find((e: any) => e.namespace === 'reclass')
  if (!translate) return ''
  return translate.data[category.toLowerCase().split(' ').join('')]?.name ?? ''
}

export const galleryUrl = (gid: number, gtoken: string, expunged = false) =>
  `https://e${expunged ? 'x' : '-'}hentai.org/g/${gid}/${gtoken}/`

export const tagUrl = (tag: string, expunged = false) =>
  `https://e${expunged ? 'x' : '-'}hentai.org/tag/${tag.split(' ').join('+')}`

export const fmtFolderName = (title: string, gid: number) =>
  `${title} [${gid}]`
    .replace(/\//g, '')
    .replace(/\|/g, '')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/  /g, ' ')
    .replace(/\?/g, '')
    .replace(/:/g, '')

export const fmtMetaJson = (meta: GalleryMeta) => ({
  ...meta,
  category_zh: translateCategory(meta.category),
  tags_zh: meta.tags.map((tag) => translateTag(tag).join(':')),
  language: (() => {
    const tag = meta.tags.find((tag) => tag.startsWith('language:'))
    if (!tag) {
      return null
    }
    return translateTag(tag).join(': ')
  })(),
})
