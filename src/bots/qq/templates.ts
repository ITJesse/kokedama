export const buildQQMessage = ({
  profilePhoto,
  username,
  message,
}: {
  profilePhoto: string
  username: string
  message: string
}) => `[CQ:image,file=${profilePhoto}]
来自电报的消息
---------------------------
${username} 说：
${message}`
