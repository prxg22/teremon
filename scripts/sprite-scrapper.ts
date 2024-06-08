import { createWriteStream } from 'fs'

import { writeReadableStreamToWritable } from '@remix-run/node'

const downloadImage = async (id: number, path: string) => {
  const url = new URL(
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/`,
  )

  url.pathname += `${id}.png`

  const response = await fetch(url.toString())

  // create file if not exists
  const fd = createWriteStream(path, {
    flags: 'w',
  })

  if (!response.body || !response.ok) {
    throw new Error('Failed to download image')
  }

  const { body } = response
  return writeReadableStreamToWritable(body, fd)
}

const downloadAllImages = async () => {
  for (let i = 1; i <= 1025; i++) {
    await downloadImage(i, `./public/sprites/${i}.png`)
  }
}

downloadAllImages()
