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
        gif: string
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

export type TelegramMessage = TelegramMsgId & TelegramProfile & TelegramMsgData
