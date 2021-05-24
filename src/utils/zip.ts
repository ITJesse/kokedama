import sevenBin from '7zip-bin'
import node7z from 'node-7z'
import path from 'path'

const pathTo7zip = sevenBin.path7za

type ArchiveInfo = {
  output: string
  filesize: string
}

export const create7Zip = (filepath: string, folder: string) => {
  const output = path.join(process.env.EXHENTAI_ARCHIVE_PATH ?? '', filepath)

  return new Promise<ArchiveInfo>((resolve, reject) => {
    const stream = node7z.add(output, folder, {
      $progress: true,
      $bin: pathTo7zip,
    })
    stream.on('end', () =>
      resolve({
        output,
        filesize: stream.info.get('Archive size') ?? '',
      }),
    )
    stream.on('error', (err) => reject(err))
  })
}
