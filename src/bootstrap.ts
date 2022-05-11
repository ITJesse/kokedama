import './bots/waifu2x/worker'

import { startBot } from './bot'
import { startApiServer } from './server'

const bot = startBot()
startApiServer(bot)
