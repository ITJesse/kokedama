import bigInt from 'big-integer'
import prompt from 'prompt'
import { Api, TelegramClient } from 'telegram'
import { Logger } from 'telegram/extensions'
import { LogLevel } from 'telegram/extensions/Logger'
import { StringSession } from 'telegram/sessions'

import { delay } from '@/utils'

const apiId = parseInt(process.env.TELEGRAM_APP_ID ?? '')
const apiHash = process.env.TELEGRAM_APP_HASH ?? ''

const stringSession = new StringSession(process.env.TELEGRAM_SESSION)

export type Member = {
  firstName?: string
  lastName?: string
  username?: string
  phone?: string
  id: string
  bot?: boolean
}

let members: Member[] = []
let updateTime = 0
let client: TelegramClient
let loging = false

const init = async (): Promise<TelegramClient> => {
  if (client) return client
  if (loging) {
    await delay(100)
    return init()
  }
  loging = true
  prompt.start()
  console.log('Connecting...')
  const _client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
    baseLogger: new Logger(LogLevel.WARN),
  })
  await _client.start({
    phoneNumber: process.env.TELEGRAM_PHONE_NUM ?? '',
    phoneCode: () =>
      prompt.get(['phoneCode']).then((res) => res.phoneCode as string),
    password: () =>
      prompt.get(['password']).then((res) => res.password as string),
    onError: (err) => console.log(err),
  })
  console.log(_client.session.save())
  console.log('You should now be connected.')
  client = _client
  loging = false
  return _client
}

export const getMembers = async () => {
  if (Date.now() - updateTime < 1 * 60 * 1000) {
    return members
  }
  const client = await init()
  const chatInfo = await client.invoke(
    new Api.channels.GetParticipants({
      channel: new Api.InputChannel({
        channelId: bigInt(process.env.TELEGRAM_CHANNEL_ID ?? ''),
        accessHash: bigInt(process.env.TELEGRAM_ACCESS_HASH ?? ''),
      }),
      filter: new Api.ChannelParticipantsSearch({ q: '' }),
      offset: 0,
      limit: 100,
      hash: bigInt.zero,
    }),
  )
  if (!(chatInfo as any).users) {
    return members
  }
  members = (chatInfo as any).users.map((e: Api.User) => ({
    firstName: e.firstName,
    lastName: e.lastName,
    username: e.username,
    phone: e.phone,
    id: e.id.toString(),
    bot: e.bot,
  }))
  updateTime = Date.now()
  return members
}
