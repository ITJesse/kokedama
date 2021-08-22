import sevenBin from '7zip-bin'
import node7z from 'node-7z'

const pathTo7zip = sevenBin.path7za

type ArchiveInfo = {
  filesize: string
}

export const create7Zip = (filepath: string, folder: string) => {
  return new Promise<ArchiveInfo>((resolve, reject) => {
    const stream = node7z.add(filepath, folder, {
      $progress: true,
      $bin: pathTo7zip,
    })
    stream.on('end', () =>
      resolve({
        filesize: stream.info.get('Archive size') ?? '',
      }),
    )
    stream.on('error', (err) => reject(err))
  })
}
