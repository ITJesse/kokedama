import axios from 'axios'

const twitterApi = axios.create({
  baseURL: 'https://api.twitter.com/',
  headers: {
    Authorization: `Bearer ${process.env.TWITTER_TOKEN ?? ''}`,
  },
})

export const getLikesByName = async (userId: string) => {
  const { data } = await twitterApi.get<{
    data: { id: string; text: string }[]
  }>(`/2/users/${userId}/liked_tweets`, {
    params: {
      max_results: 20,
    },
  })
  return data
}

export const getTweetById = async (id: string) => {
  const { data } = await twitterApi.get(`/2/tweets/${id}`, {
    params: {
      expansions: 'attachments.media_keys,author_id',
      'tweet.fields': 'id',
      'user.fields': 'name,username,url',
      'media.fields': 'url,preview_image_url,variants',
    },
  })
  return data
}

export const getOrigImgUrl = (url: string) => `${url}:orig`
export const getTweetUrl = (username: string, id: string | number) =>
  `https://twitter.com/${username}/status/${id}`
export const getUserUrl = (username: string) =>
  `https://twitter.com/${username}`
