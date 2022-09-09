import axios from 'axios'
import { Markup, Telegraf } from 'telegraf'
import { User } from 'telegraf/typings/core/types/typegram'

import { getTweetById, getTweetUrl, getUserToken } from '../utils'

export const favoriteTweet = async (
  bot: Telegraf,
  tgUser: User,
  tweetId: string,
  groupId: number,
) => {
  const token = await getUserToken(tgUser.id)
  if (!token) {
    const username = tgUser.username
      ? `\@${tgUser.username}`
      : `[${tgUser.last_name ?? ''} ${tgUser.first_name ?? ''}](tg://user?id=${
          tgUser.id
        })`
    const msg = await bot.telegram.sendMessage(
      groupId,
      `${username} 请先私聊我 /bind_twitter 命令绑定 Twitter 账号`,
      { parse_mode: 'MarkdownV2' },
    )
    setTimeout(() => bot.telegram.deleteMessage(groupId, msg.message_id), 15000)
    return
  }

  const { tokenSet, user } = token
  try {
    await axios.post(
      `https://api.twitter.com/2/users/${user.id}/likes`,
      {
        tweet_id: tweetId,
      },
      {
        headers: {
          Authorization: `Bearer ${tokenSet.access_token}`,
        },
      },
    )
    const tweet = await getTweetById(tweetId)
    await bot.telegram.sendMessage(tgUser.id, `已收藏推文`, {
      reply_markup: Markup.inlineKeyboard([
        Markup.button.url(
          '推文链接',
          getTweetUrl(tweet.includes.users[0].username, tweetId),
        ),
      ]).reply_markup,
    })
  } catch (err) {
    console.log(err)
  }
}
