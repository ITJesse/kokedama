export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

export const getName = ({
  first_name,
  last_name,
  username,
}: {
  first_name: string
  last_name?: string
  username?: string
}) => {
  const name = [first_name, last_name].filter((e) => !!e).join(' ') ?? username
  return name
}
