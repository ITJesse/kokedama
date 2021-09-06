import axios from 'axios'
import FormData from 'form-data'
import { RateLimiter } from 'limiter'
import { Options, SagiriResult } from 'sagiri'

import { Response, Result } from './response'
import sites from './sites'

const limiter = new RateLimiter({ tokensPerInterval: 10, interval: 30000 })

export const generateMask = (masks: number[]): number =>
  masks.reduce(
    (prev, curr) =>
      prev ^ parseInt('1' + '0'.repeat(curr >= 17 ? curr - 1 : curr), 2),
    0,
  )

export function resolveResult(result: Result): any {
  const { data, header } = result
  const id = header.index_id

  if (!sites[id]) throw new Error(`Cannot resolve data for unknown index ${id}`)

  const { name, urlMatcher, backupUrl, authorData } = sites[id]!
  let url: string | undefined

  // Try to find matching url from ones provided by SauceNAO
  if (data.ext_urls && data.ext_urls.length > 1)
    [url] = data.ext_urls.filter((url) => urlMatcher.test(url))
  else if (data.ext_urls) [url] = data.ext_urls

  // If we can't find out, generate one ourselves
  if (!url) url = backupUrl(result)

  return {
    id,
    url,
    name,
    ...(authorData?.(result.data) ?? { authorName: null, authorUrl: null }),
  }
}

export const search = async (
  file: Buffer,
  options?: Options,
): Promise<SagiriResult[]> => {
  const remaining = await limiter.removeTokens(1)
  if (remaining < 0) {
    throw new Error('rate limit')
  }
  const form = new FormData()
  form.append('output_type', '2')
  form.append('api_key', process.env.SAUCENAO_API_KEY)
  if (options?.results) {
    form.append('numres', options.results)
  }
  if (options?.mask) {
    form.append('dbmask', generateMask(options.mask))
  }
  if (options?.excludeMask) {
    form.append('dbmaski', generateMask(options.excludeMask))
  }
  if (options?.db) {
    form.append('db', options.db)
  }
  if (options?.testMode) {
    form.append('testmode', options.testMode)
  }
  form.append('file', file, { filename: 'file' })
  const { data } = await axios.post<Response>(
    'https://saucenao.com/search.php',
    form,
    {
      headers: form.getHeaders(),
    },
  )

  const results = ((data as Response).results ?? [])
    .filter(({ header: { index_id: id } }) => !!sites[id])
    .sort((a, b) => b.header.similarity - a.header.similarity)

  return results.map((result) => {
    const { url, name, id, authorName, authorUrl } = resolveResult(result)
    const {
      header: { similarity, thumbnail },
    } = result

    return {
      url,
      site: name,
      index: id as any as number, // These are actually numbers but they're typed as strings so they can be used to select from the sites map
      similarity: Number(similarity),
      thumbnail,
      authorName,
      authorUrl,
      raw: result,
    }
  })
}
