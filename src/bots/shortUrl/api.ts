import { Router } from 'express'
import { pipe } from 'fp-ts/lib/function'
import * as io from 'io-ts'
import isUrl from 'is-url'

import { E, TE } from '@/lib/fp'
import adminQuery from '@/lib/gql/admin'
import { hashids } from '@/lib/hashids'

const router = Router()

const ShortUrlQueryDecoder = io.type({
  url: io.string,
})
router.post('/short_url', async (req, res) => {
  const query = await pipe(
    ShortUrlQueryDecoder.decode(req.body),
    TE.fromEither,
  )()
  if (E.isLeft(query)) {
    return res.status(400).json({ success: false, message: query.left })
  }
  if (!isUrl(query.right.url)) {
    return res.status(400).json({ success: false, message: 'bad input' })
  }
  const { insert_short_url_one } = await adminQuery('AddUrl', {
    url: query.right.url,
  })
  if (!insert_short_url_one) {
    return res.status(500).json({ success: false, message: 'server error' })
  }

  const { id } = insert_short_url_one
  const hashed = hashids.encode(id)

  return res.json({
    success: true,
    shorten: `${process.env.SHORTEN_URL_PREFIX}${hashed}`,
  })
})

router.get('/short_url/:hashed', async (req, res) => {
  const { hashed } = req.params
  try {
    const id = parseInt(hashids.decode(hashed)[0].toString())
    const { short_url_by_pk } = await adminQuery('GetUrl', { id })
    if (short_url_by_pk) {
      return res.redirect(301, short_url_by_pk.url)
    }
  } catch {}

  return res.status(404).json({ sucess: false, message: 'not found' })
})

export default router
