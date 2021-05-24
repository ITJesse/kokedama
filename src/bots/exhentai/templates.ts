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
