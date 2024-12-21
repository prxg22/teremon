import sqlite3 from "better-sqlite3"

const { DATABASE_URL } = process.env

if (!DATABASE_URL) throw new Error("DATABASE_URL is not set")

export const db = new sqlite3(DATABASE_URL)

db.exec(`CREATE TABLE IF NOT EXISTS pokemon (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  like BOOLEAN NOT NULL DEFAULT FALSE
)`)

db.exec(`CREATE TABLE IF NOT EXISTS evolutions (
  pokemon_id  INTEGER NOT NULL,
  chain_id    INTEGER NOT NULL,
  stage       INTEGER NOT NULL,
  FOREIGN KEY (pokemon_id) REFERENCES pokemon(id),
  PRIMARY KEY (pokemon_id, chain_id)
)`)

db.exec(`CREATE TABLE IF NOT EXISTS types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
)`)

db.exec(`CREATE TABLE IF NOT EXISTS pokemon_types ( 
  pokemon_id INTEGER NOT NULL, 
  type_id INTEGER NOT NULL,
  PRIMARY KEY (pokemon_id, type_id)
  FOREIGN KEY (pokemon_id) REFERENCES pokemon(id)
  FOREIGN KEY (type_id) REFERENCES types(id)
)
`)
