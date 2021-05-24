import axios from 'axios'

const twitterApi = axios.create({
  baseURL: 'https://api.twitter.com/',
  headers: {
    Authorization: `Bearer ${process.env.TWITTER_TOKEN ?? ''}`,
  },
})

export const getLikesByName = async (name: string) => {
  const { data } = await twitterApi.get(
    '/1.1/favorites/list.json?screen_name=' + name,
  )
  console.log(data)
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
