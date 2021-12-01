export const buildQQMessage = ({
  profilePhoto,
  username,
  message,
}: {
  profilePhoto: string
  username: string
  message: string
}) => `[CQ:image,file=${profilePhoto}]${username} 说：
${message}`
