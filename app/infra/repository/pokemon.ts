import sqlite3 from 'sqlite3'

import type { Pokemon, Type, TypeInfo } from '../../models/Pokemon'
import { connect } from '../db'

let db: Awaited<ReturnType<typeof connect>>

export const connectDB = async () => {
  const { DATABASE_URL } = process.env

  if (!DATABASE_URL) throw new Error('DATABASE_URL is not set')
  if (db) return
  try {
    await connect({
      filename: DATABASE_URL,
      mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    }).then((connection) => {
      db = connection
      console.log(`database initiated on: ${DATABASE_URL}`)
    })
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

await connectDB()

const createPokemonTable = async () => {
  await connectDB()

  // create pokemon table
  await db.run(`CREATE TABLE IF NOT EXISTS pokemon (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    like BOOLEAN NOT NULL DEFAULT FALSE
  )`)
}

const insertPokemon = async (pokemon: Pokemon) => {
  await connectDB()

  const result = await db.get('SELECT * FROM pokemon WHERE id = ?', pokemon.id)

  if (!result) {
    await db.run(
      'INSERT INTO pokemon (id, name, like) VALUES (?, ?, ?)',
      pokemon.id,
      pokemon.name,
      pokemon.like,
    )
  }
}

const createTypeTable = async () => {
  await connectDB()

  // create type table
  await db.run(`CREATE TABLE IF NOT EXISTS type (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  )`)
}

const createPokemonTypeTable = async () => {
  await connectDB()

  await db.run(`CREATE TABLE IF NOT EXISTS pokemon_type ( 
    pokemon_id INTEGER NOT NULL, 
    type_id INTEGER NOT NULL,
    FOREIGN KEY (pokemon_id) REFERENCES pokemon(id)
    FOREIGN KEY (type_id) REFERENCES type(id)
    PRIMARY KEY (pokemon_id, type_id)
  )
  `)
}

const insertType = async (type: Type): Promise<Type> => {
  await connectDB()

  let result = await db.get<Type>(
    'SELECT * FROM type WHERE name = ?',
    type.name,
  )

  if (result) {
    console.log(`found type ${type.name} in the database`, result)
    return result
  }

  console.log('inserting type', type.name)
  await db.run('INSERT INTO type (name) VALUES (?)', type.name)

  result = await db.get<Type>('SELECT * FROM type WHERE name = ?', type.name)
  console.log(`type ${type.name} inserted`, result)
  if (!result) throw Error('Type was not inserted')

  return result
}

const insertPokemonType = async (pokemonId: number, typeId: number) => {
  await connectDB()
  const pokemonType = await db.get(
    `SELECT * FROM pokemon_type WHERE pokemon_id = ? AND type_id = ?`,
    pokemonId,
    typeId,
  )
  if (pokemonType) return

  await db.run(
    'INSERT INTO pokemon_type (pokemon_id, type_id) VALUES (?, ?)',
    pokemonId,
    typeId,
  )
}

export const seed = async (seed?: { pokemons?: Pokemon[] }) => {
  await connectDB()

  await Promise.all([
    createPokemonTable(),
    createTypeTable(),
    createPokemonTypeTable(),
  ])

  if (!seed?.pokemons?.length) return

  for (const pokemon of seed.pokemons) {
    await insertPokemon(pokemon)
    for (const t of pokemon.types) {
      const type = await insertType(t)
      await insertPokemonType(pokemon.id, type.id)
    }
  }
}

export const getAll = async (options?: { limit?: number; offset?: number }) => {
  await connectDB()

  const { limit = 20, offset = 0 } = options || {}
  const results = await db.all<(Omit<Pokemon, 'types'> & { types: string })[]>(
    `SELECT 
      pokemon.id, 
      pokemon.name, 
      pokemon.like, 
      json_group_array(
        json_object('id', type.id, 'name', type.name)
      ) as types
    FROM pokemon 
    JOIN pokemon_type 
      ON pokemon.id = pokemon_type.pokemon_id
    JOIN type 
      ON pokemon_type.type_id = type.id
    GROUP BY pokemon.id, pokemon.name, pokemon.like
    LIMIT ? OFFSET ?`,
    limit,
    offset,
  )

  const pokemons = results.map((pokemon) => {
    return { ...pokemon, types: JSON.parse(pokemon.types) as TypeInfo[] }
  })

  return pokemons as Pokemon[]
}

export const get = async (id: number) => {
  await connectDB()

  const pokemon = await db.get(
    `SELECT 
      pokemon.id, 
      pokemon.name, 
      pokemon.like, 
      json_group_array(
        json_object('id', type.id, 'name', type.name)
        ) as types
    FROM pokemon 
    JOIN pokemon_type 
      ON pokemon.id = pokemon_type.pokemon_id
    JOIN type 
      ON pokemon_type.type_id = type.id
    WHERE pokemon.id = ?
    GROUP BY pokemon.id, pokemon.name, pokemon.like
  `,
    id,
  )

  return pokemon as Pokemon
}

export const update = async (pokemon: Pokemon) => {
  const { id, name, like } = pokemon
  await db.run(
    'UPDATE pokemon SET name = ?, like = ? WHERE id = ?',
    name,
    like,
    id,
  )
}
