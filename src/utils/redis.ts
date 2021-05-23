import redis from 'redis'
import { promisify } from 'util'

export const client = redis.createClient()

export const get = promisify(client.get).bind(client)
export const set = promisify(client.set).bind(client)
export const setex = promisify(client.setex).bind(client)
export const hget = promisify(client.hget).bind(client)
export const hgetall = promisify(client.hgetall).bind(client)
export const hset = promisify(client.hset).bind(client)
export const hdel: (arg1: string[]) => Promise<number> = promisify(
  client.hdel,
).bind(client)
export const hmget = promisify(client.hmget).bind(client)
export const hmset = promisify(client.hmset).bind(client)
export const keys = promisify(client.keys).bind(client)
export const hkeys = promisify(client.hkeys).bind(client)
export const del: (key: string) => Promise<number> = promisify(client.del).bind(
  client,
)
