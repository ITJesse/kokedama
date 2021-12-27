import assert from 'assert'
import crypto from 'crypto'
import fs from 'fs'
import { execFile } from 'mz/child_process'
import ObjectID64 from 'objectid64'

const encoder = ObjectID64()

const blacklist = ['/dl', '/src', '/hso', '/now', '/temp', 'xu1s.com']
export const hasBlacklistedWord = (str: string) => {
  return blacklist.some((e) => str.includes(e))
}

export const getVideoDimensions = (buf: Buffer) => {
  const hash = encoder.encode(
    crypto.createHash('md5').update(buf).digest('hex'),
  )
  const filePath = '/tmp/' + hash + '.mp4'
  fs.writeFileSync(filePath, buf)

  return execFile('ffprobe', [
    '-v',
    'error',
    '-of',
    'flat=s=_',
    '-select_streams',
    'v:0',
    '-show_entries',
    'stream=height,width',
    filePath,
  ]).then(function (out) {
    var stdout = out[0].toString()
    var width = /width=(\d+)/.exec(stdout)
    var height = /height=(\d+)/.exec(stdout)
    assert(width && height, 'No dimensions found!')
    fs.unlink(filePath, () => undefined)
    return {
      width: parseInt(width[1]),
      height: parseInt(height[1]),
    }
  })
}
