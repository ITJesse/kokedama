import { User } from 'telegraf/typings/core/types/typegram'

type TelegramProfile = {
  fromUser: User
}

type TelegramMsgId = {
  telegramMsgId?: number
  replyToMsgId?: number
}

export type TelegramImageData = {
  groupId?: string
  image: string
  caption?: string
  msgId: number
  flash?: boolean
}

type TelegramMsgData =
  | {
      type: 'text'
      data: string
    }
  | {
      type: 'video'
      data: {
        video: string
        caption?: string
      }
    }
  | {
      type: 'animation'
      data: {
        video: string
        caption?: string
      }
    }
  | {
      type: 'image'
      data: TelegramImageData
    }
  | {
      type: 'image_group'
      data: {
        groupId: string
      }
    }
  | {
      type: 'recall'
      data: {
        msgId: number
      }
    }

export type QQProfile = {
  title: string
  nickname: string
}
export type QQMsgId = {
  qqMsgId?: number
  replyToMsgId?: number
}

export type TelegramMessage = TelegramMsgId & TelegramProfile & TelegramMsgData
export type QQMessage = QQProfile & QQMsgId & TelegramMsgData
