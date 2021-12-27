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
