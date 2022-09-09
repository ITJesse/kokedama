import axios from 'axios'
import { Router } from 'express'
import { constVoid } from 'fp-ts/lib/function'
import { generators } from 'openid-client'

import { TWITTER_BIND_SESSION_PREFIX, TWITTER_TOKEN_PREFIX } from '@/utils/consts'
import redis from '@/utils/redis'

import { authorizationRequest, oauthClient, tokenRequest } from './utils'

const router = Router()

router.get('/connect', async (req, res) => {
  const { session } = req.query
  if (!session || typeof session !== 'string') {
    return res.status(400).send('参数错误')
  }
  const telegramId = await redis.get(`${TWITTER_BIND_SESSION_PREFIX}${session}`)
  if (!telegramId) {
    return res.status(404).send('链接无效或已过期')
  }

  const state = generators.state()
  const codeVerifier = generators.codeVerifier()
  const codeChallenge = generators.codeChallenge(codeVerifier)
  const url = authorizationRequest(oauthClient, {
    state,
    scope: 'tweet.read users.read like.write offline.access',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })
  req.session.state = state
  req.session.code_verifier = codeVerifier
  req.session.sessionKey = session
  return res.redirect(url)
})

router.get('/callback', async (req, res) => {
  const state = req.session.state
  if (typeof state != 'string') {
    return res.status(500).send('state must be a string')
  }
  const codeVerifier = req.session.code_verifier
  if (typeof codeVerifier != 'string') {
    return res.status(500).send('code_verifier must be a string')
  }
  const tokenSet = await tokenRequest(req, oauthClient, {
    redirect_uri: `${process.env.BASE_URL}/pub/twitter/callback`,
    client_id: process.env.TWITTER_CLIENT_ID ?? '',
    code_verifier: codeVerifier,
    state: state,
  })

  const { data } = await axios.get('https://api.twitter.com/2/users/me', {
    headers: {
      Authorization: `Bearer ${tokenSet?.access_token}`,
    },
  })
  const username = data.data.username

  const telegramId = await redis.get(
    `${TWITTER_BIND_SESSION_PREFIX}${req.session.sessionKey}`,
  )
  if (!telegramId) {
    return res.status(404).send('链接无效或已过期')
  }
  await redis.set(
    `${TWITTER_TOKEN_PREFIX}${telegramId}`,
    JSON.stringify({ tokenSet, user: data.data }),
  )
  req.session.destroy(constVoid)
  await req.bot?.telegram.sendMessage(
    telegramId,
    `绑定成功，用户名: @${username}`,
  )
  return res.send('绑定成功')
})

export default router
