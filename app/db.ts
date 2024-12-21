import { open } from 'sqlite'
import sqlite3 from 'sqlite3'

export async function connect(config: { filename: string; mode: number }) {
  const db = await open({
    filename: config.filename,
    driver: sqlite3.Database,
    mode: config.mode || sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  })

  return db
}
