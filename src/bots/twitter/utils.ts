import axios from 'axios'
import { Request } from 'express'
import { BaseClient, Issuer, IssuerMetadata, TokenSet } from 'openid-client'

import { TWEET_INFO_CACHE_PREFIX, TWITTER_TOKEN_PREFIX } from '@/utils/consts'
import redis from '@/utils/redis'

const twitterApi = axios.create({
  baseURL: 'https://api.twitter.com/',
  headers: {
    Authorization: `Bearer ${process.env.TWITTER_TOKEN ?? ''}`,
  },
})

export const getTweetById = async (id: string) => {
  const cache = await redis.get(`${TWEET_INFO_CACHE_PREFIX}${id}`)
  if (cache) return JSON.parse(cache)
  const { data } = await twitterApi.get(`/2/tweets/${id}`, {
    params: {
      expansions: 'attachments.media_keys,author_id',
      'tweet.fields': 'id',
      'user.fields': 'name,username,url',
      'media.fields': 'url,preview_image_url,variants',
    },
  })
  await redis.setex(
    `${TWEET_INFO_CACHE_PREFIX}${id}`,
    60 * 60 * 24,
    JSON.stringify(data),
  )
  return data
}

export const getOrigImgUrl = (url: string) => `${url}:orig`
export const getTweetUrl = (username: string, id: string | number) =>
  `https://twitter.com/${username}/status/${id}`
export const getUserUrl = (username: string) =>
  `https://twitter.com/${username}`

export const getUserToken = async (telegramId: number) => {
  const tokenSetJson = await redis.get(`${TWITTER_TOKEN_PREFIX}${telegramId}`)
  if (!tokenSetJson) {
    return null
  }
  const obj = JSON.parse(tokenSetJson) as {
    tokenSet: TokenSet
    user: { id: string; name: string; username: string }
  }
  let tokenSet = new TokenSet(obj.tokenSet)
  let user = obj.user

  if (tokenSet.expired()) {
    const newTokenSet = await oauthClient.refresh(tokenSet.refresh_token ?? '')
    const { data } = await axios.get('https://api.twitter.com/2/users/me', {
      headers: {
        Authorization: `Bearer ${newTokenSet.access_token}`,
      },
    })
    await redis.set(
      `${TWITTER_TOKEN_PREFIX}${telegramId}`,
      JSON.stringify({ tokenSet: newTokenSet, user: data.data }),
    )
    tokenSet = newTokenSet
    user = data.data
  }
  return { tokenSet, user }
}

export interface AuthorizationRequestOptions {
  state: string
  scope?: string
  code_challenge: string
  code_challenge_method: string
}

export interface TokenRequestOptions {
  client_id: string
  redirect_uri: string
  code_verifier: string
  state: string
}

export function authorizationRequest(
  client: BaseClient,
  options: AuthorizationRequestOptions,
): string {
  const url: string = client.authorizationUrl({
    response_type: 'code',
    scope: options.scope ?? 'tweet.read users.read offline.access',
    state: options.state,
    code_challenge: options.code_challenge,
    code_challenge_method: options.code_challenge_method,
  })
  return url
}

const issOpt: IssuerMetadata = {
  issuer: 'https://twitter.com',
  authorization_endpoint: 'https://twitter.com/i/oauth2/authorize',
  token_endpoint: 'https://api.twitter.com/2/oauth2/token',
}
const issuer: Issuer = new Issuer(issOpt)
export const oauthClient: BaseClient = new issuer.Client({
  client_id: process.env.TWITTER_CLIENT_ID ?? '',
  client_secret: process.env.TWITTER_CLIENT_SECRET,
  redirect_uris: [`${process.env.BASE_URL}/pub/twitter/callback`],
  token_endpoint_auth_method: 'client_secret_basic',
})

export async function tokenRequest(
  req: Request,
  client: BaseClient,
  options: TokenRequestOptions,
): Promise<TokenSet> {
  const state = options.state
  const codeVerifier = options.code_verifier
  const params = client.callbackParams(req)
  const tokenSet = await client.oauthCallback(
    options.redirect_uri,
    params,
    { code_verifier: codeVerifier, state },
    { exchangeBody: { client_id: options.client_id } },
  )
  return tokenSet
}
