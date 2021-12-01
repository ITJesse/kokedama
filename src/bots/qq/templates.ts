export const buildQQMessage = ({
  profilePhoto,
  username,
  message,
}: {
  profilePhoto: string
  username: string
  message: string
}) => `来自电报的消息
---------------------------
[CQ:image,file=${profilePhoto}]${username} 说：
${message}`
