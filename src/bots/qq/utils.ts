import assert from 'assert'
import axios from 'axios'
import crypto from 'crypto'
import fs from 'fs'
import { execFile } from 'mz/child_process'
import ObjectID64 from 'objectid64'

const encoder = ObjectID64()

const client = axios.create({
  baseURL: process.env.CQHTTP_ENDPOINT,
  method: 'POST',
})

type CQHTTPResponse<T> = {
  data: {
    data: T
    retcode: number
    status: string
  }
}

export const sendMessage = (message: string) =>
  client
    .post<unknown, CQHTTPResponse<{ message_id: number }>>('/send_group_msg', {
      group_id: process.env.QQ_GROUP_ID,
      message,
    })
    .then(({ data }) => data.data)

export const getGroupMemberInfo = (user_id: number) =>
  client
    .post<
      unknown,
      CQHTTPResponse<{
        age: number
        area: string
        card: string
        card_changeable: boolean
        group_id: number
        join_time: number
        last_sent_time: number
        level: string
        nickname: string
        role: string
        sex: string
        shut_up_timestamp: number
        title: string
        title_expire_time: number
        unfriendly: boolean
        user_id: number
      }>
    >('/get_group_member_info', {
      group_id: process.env.QQ_GROUP_ID,
      user_id,
    })
    .then(({ data }) => data.data)

const blacklist = ['/dl', '/src', '/hso', '/now', '/temp', 'xu1s.com']
export const hasBlacklistedWord = (str: string) => {
  return blacklist.some((e) => str.includes(e))
}

export const getVideoDimensions = (buf: Buffer) => {
  const hash = encoder.encode(
    crypto.createHash('md5').update(buf).digest('hex'),
  )
  const filePath = '/tmp/' + hash + '.mp4'
  fs.writeFileSync(filePath, buf)

  return execFile('ffprobe', [
    '-v',
    'error',
    '-of',
    'flat=s=_',
    '-select_streams',
    'v:0',
    '-show_entries',
    'stream=height,width',
    filePath,
  ]).then(function (out) {
    var stdout = out[0].toString()
    var width = /width=(\d+)/.exec(stdout)
    var height = /height=(\d+)/.exec(stdout)
    assert(width && height, 'No dimensions found!')
    fs.unlink(filePath, () => undefined)
    return {
      width: parseInt(width[1]),
      height: parseInt(height[1]),
    }
  })
}
