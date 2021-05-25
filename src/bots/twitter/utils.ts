import axios from 'axios'
import { Status } from 'twitter-d'

const twitterApi = axios.create({
  baseURL: 'https://api.twitter.com/',
  headers: {
    Authorization: `Bearer ${process.env.TWITTER_TOKEN ?? ''}`,
  },
})

export const getLikesByName = async (name: string) => {
  const { data } = await twitterApi.get<Status[]>('/1.1/favorites/list.json', {
    params: {
      screen_name: name,
      since_id: 1396665396929830912,
    },
  })
  return data
}

export const getTweetById = async (id: string) => {
  const { data } = await twitterApi.get(`/2/tweets/${id}`, {
    params: {
      expansions: 'attachments.media_keys,author_id',
      'user.fields': 'name,username,url',
      'media.fields': 'url,preview_image_url',
    },
  })
  return data
}

export const getOrigImgUrl = (url: string) => `${url}:orig`
export const getTweetUrl = (username: string, id: string | number) =>
  `https://twitter.com/${username}/status/${id}`
export const getUserUrl = (username: string) =>
  `https://twitter.com/${username}`
