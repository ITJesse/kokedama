import dayjs from 'dayjs'

import { GalleryMeta } from './types'
import { tagUrl, translateCategory, translateTag } from './utils'

export const galleryMetaTemplate = (meta: GalleryMeta) => {
  const language = (() => {
    const tag = meta.tags.find((tag) => tag.startsWith('language:'))
    if (!tag) {
      return null
    }
    return translateTag(tag).join(': ')
  })()

  const tags = meta.tags
    .map((tag) => translateTag(tag).join(':'))
    .map(
      (translated, index) =>
        `<a href="${tagUrl(
          meta.tags[index],
          meta.expunged,
        )}">#${translated}</a>`,
    )

  const rows = [
    `上传者: ${meta.uploader}`,
    `分类: ${translateCategory(meta.category)}`,
    `发布时间: ${dayjs(parseInt(meta.posted) * 1000).format(
      'YYYY-MM-DD HH:mm',
    )}`,
    language,
    `页数: ${meta.filecount}`,
    `评分: ${meta.rating}`,
    `里站限定: ${meta.expunged ? '是' : '否'}`,
    tags.length > 0 ? `标签: ${tags.join(' ')}` : null,
  ].filter((e) => !!e)

  return `<b>E-Hentai</b>

${!!meta.title_jpn ? meta.title_jpn : meta.title}

${rows.join('\n')}`
}

export const galleryDownloadTemplate = (
  name: string,
  current: number,
  total: number,
) => {
  const p = Math.ceil((current / total) * 10)
  const done = Array(p)
    .fill(0)
    .map((_) => '▇')
    .join('')
  const empty = Array(10 - p)
    .fill(0)
    .map((_) => '＿')
    .join('')
  return `<b>E-Hentai 下载器</b>

${name} 下载中...

[${done}${empty}] ${current}/${total}`
}

export const galleryArchiveTemplate = (name: string) => `<b>E-Hentai 下载器</b>

${name} 打包中...`

export const galleryUploadTemplate = (name: string) => `<b>E-Hentai 下载器</b>

${name} 上传中...`

export const galleryDoneTemplate = (
  name: string,
  filesize: string,
) => `<b>E-Hentai 下载器</b>

${name} 下载完成
文件大小: ${filesize}`
