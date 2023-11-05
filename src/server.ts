import connectRedis from 'connect-redis'
import express from 'express'
import session from 'express-session'
import morgan from 'morgan'
import { TokenSet } from 'openid-client'
import { Telegraf } from 'telegraf'

import redis from '@/utils/redis'

import exhentaiApi from './bots/exhentai/api'
import groupApi from './bots/group/api'
import twitterApi from './bots/twitter/api'
import waifu2xApi from './bots/waifu2x/api'
import WooCommerceRouter from './bots/woocommerce/api'
import { errorHandler } from './middleware/errorHandler'

const RedisStore = connectRedis(session)

declare global {
  namespace Express {
    export interface Request {
      bot?: Telegraf
    }
  }
}
declare module 'express-session' {
  export interface SessionData {
    tokenSet: TokenSet
    state: string
    code_verifier: string
    sessionKey: string
  }
}

export const startApiServer = (bot: Telegraf) => {
  const woocommerceApi = WooCommerceRouter(bot)
  // API Server
  const app = express()
  const port = process.env.PORT ?? 3000

  app.use((req, res, next) => {
    req.bot = bot
    next()
  })
  app.use(morgan('dev'))
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(
    session({
      name: 'kokedama-express',
      secret: process.env.SESSION_SECRET ?? 'your_session_secret',
      resave: false,
      saveUninitialized: true,
      store: new RedisStore({ client: redis }),
    }),
  )

  app.use('/s/:gid/:gtoken', (req, res) => {
    const { gid, gtoken } = req.params
    res.redirect(
      `${process.env.EXHENTAI_NFS_BASEURL}/${gid}/${gtoken}/archive.7z`,
      301,
    )
  })

  app.use('/pub/twitter', twitterApi)

  app.use('/api', (req, res, next) => {
    const auth = req.headers['x-kokedama-auth-key']
    if (!auth || auth !== process.env.API_KEY) {
      return res.status(401).json({ success: false, message: 'auth failed' })
    }
    next()
  })
  app.use('/api', exhentaiApi)
  app.use('/api/waifu2x', waifu2xApi)
  app.use('/api/group', groupApi)

  app.use('/webhook/woocommerce', woocommerceApi)

  app.use(errorHandler)

  app.listen(port, () => {
    console.log(`API server listening at http://localhost:${port}`)
  })
}
