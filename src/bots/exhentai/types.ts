export type GalleryTorrent = {
  hash: string
  added: string
  name: string
  tsize: string
  fsize: string
}

export type GalleryMeta = {
  gid: number
  token: string
  archiver_key: string
  title: string
  title_jpn: string
  category: string
  thumb: string
  uploader: string
  posted: string
  filecount: string
  filesize: number
  expunged: boolean
  rating: string
  torrentcount: string
  torrents: GalleryTorrent[]
  tags: string[]
}

export type GalleryMetaResponse = {
  gmetadata: GalleryMeta[]
}

export type GalleryTokenResponse = {
  tokenlist: { gid: number; token: string }[]
}

export type DownloadTaskPayload = {
  groupId?: number
  msgId?: number
  taskId?: string
  meta: GalleryMeta
}

export type DownloadTaskStatus =
  | {
      status: 'downloading'
      data: {
        total: number
        current: number
      }
    }
  | {
      status: 'archiving'
      data: {}
    }
  | {
      status: 'done'
      data: {
        url: string
      }
    }
