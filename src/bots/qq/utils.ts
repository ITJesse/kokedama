import axios from 'axios'

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

export const replyMessage = (replyTo: number, message: string) =>
  sendMessage(`[CQ:reply,id=${replyTo}]${message}`)

export const sendImage = (imageUrl: string, message: string) =>
  sendMessage(`[CQ:image,file=${imageUrl}]${message}`)

const blacklist = ['/dl', '/src', '/hso', '/now', '/temp', 'xu1s.com']
export const hasBlacklistedWord = (str: string) => {
  return blacklist.some((e) => str.includes(e))
}
