import express from 'express'
import morgan from 'morgan'

import exhentaiApi from './bots/exhentai/api'
import groupApi from './bots/group/api'
import shortUrlApi from './bots/shortUrl/api'
import waifu2xApi from './bots/waifu2x/api'
import woocommerceApi from './bots/woocommerce/api'

// API Server
const app = express()
const port = process.env.PORT ?? 3000

app.use(morgan('combined'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/s/:gid/:gtoken', (req, res) => {
  const { gid, gtoken } = req.params
  res.redirect(
    `${process.env.EXHENTAI_NFS_BASEURL}/${gid}/${gtoken}/archive.7z`,
    301,
  )
})

app.use('/api', (req, res, next) => {
  const auth = req.headers['x-kokedama-auth-key']
  if (!auth || auth !== process.env.API_KEY) {
    return res.status(401).json({ success: false, message: 'auth failed' })
  }
  next()
})
app.use('/api', exhentaiApi)
app.use('/api', shortUrlApi)
app.use('/api/waifu2x', waifu2xApi)
app.use('/api/group', groupApi)

app.use('/webhook/woocommerce', woocommerceApi)

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`)
})
