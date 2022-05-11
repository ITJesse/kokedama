import { Router } from 'express'

const router = Router()

router.post('/new_order', async (req, res) => {
  console.log(req.query)
  console.log(req.body)
  console.log(req.headers)
  res.send('ok')
})

export default router
