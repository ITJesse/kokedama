import { Router } from 'express'

import { getMembers } from '@/lib/telegram'

const router = Router()

router.get('/members', async (req, res) => {
  const members = await getMembers()

  res.json({
    success: true,
    members,
  })
})

export default router
