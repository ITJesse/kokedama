import * as TE from 'fp-ts/lib/TaskEither'
import { GraphQLClient } from 'graphql-request'

import { getSdk, Sdk } from './types'

export const clientQuery = <T extends keyof Sdk>(
  client: GraphQLClient,
  key: T,
  vars?: Parameters<Sdk[T]>[0],
): ReturnType<Sdk[T]> => (getSdk(client)[key] as any)(vars)
