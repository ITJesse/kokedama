import { GraphQLClient } from 'graphql-request'

import { getSdk, Sdk } from './types'

export const adminClient = new GraphQLClient(
  process.env.GRAPHQL_ENDPOINT ?? '',
  {
    headers: {
      'x-hasura-admin-secret': process.env.GRAPHQL_ADMIN_SECRET ?? '',
    },
  },
)

export const adminQuery = <T extends keyof Sdk>(
  key: T,
  vars?: Parameters<Sdk[T]>[0],
): ReturnType<Sdk[T]> => (getSdk(adminClient)[key] as any)(vars)

export default adminQuery
