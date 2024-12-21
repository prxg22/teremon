import sqlite3 from "sqlite3"

import type { Pokemon, Type, TypeInfo } from "../dtos/Pokemon"
import { connect } from "~/db"

let db: Awaited<ReturnType<typeof connect>>

type DBPokemon = Omit<Pokemon, "types"> & {
  types: string
  evolutions_to: string
  evolutions_from: string
}

export const connectDB = async () => {
  const { DATABASE_URL } = process.env

  if (!DATABASE_URL) throw new Error("DATABASE_URL is not set")
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

export const createPokemonTable = async () => {
  await connectDB()

  // create pokemon table
  await db.run(`CREATE TABLE IF NOT EXISTS pokemon (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    like BOOLEAN NOT NULL DEFAULT FALSE
  )`)
}

export const createEvolutionTable = async () => {
  await connectDB()

  await db.run(`CREATE TABLE IF NOT EXISTS evolutions (
    pokemon_id  INTEGER NOT NULL,
    chain_id    INTEGER NOT NULL,
    stage       INTEGER NOT NULL,
    FOREIGN KEY (pokemon_id) REFERENCES pokemon(id),
    PRIMARY KEY (pokemon_id, chain_id)
  )`)
}

export const createTypeTable = async () => {
  await connectDB()

  // create type table
  await db.run(`CREATE TABLE IF NOT EXISTS type (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  )`)
}

export const createPokemonTypeTable = async () => {
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

export const insertPokemon = async (pokemon: Pokemon) => {
  await connectDB()

  const result = await db.get("SELECT * FROM pokemon WHERE id = ?", pokemon.id)

  if (!result) {
    await db.run(
      "INSERT INTO pokemon (id, name, like) VALUES (?, ?, ?)",
      pokemon.id,
      pokemon.name,
      pokemon.like
    )
  }
}

export const insertType = async (type: Type): Promise<Type> => {
  await connectDB()

  let result = await db.get<Type>(
    "SELECT * FROM type WHERE name = ?",
    type.name
  )

  if (result) {
    console.log(`found type ${type.name} in the database`, result)
    return result
  }

  console.log("inserting type", type.name)
  await db.run("INSERT INTO type (name) VALUES (?)", type.name)

  result = await db.get<Type>("SELECT * FROM type WHERE name = ?", type.name)
  console.log(`type ${type.name} inserted`, result)
  if (!result) throw Error("Type was not inserted")

  return result
}

export const insertPokemonType = async (pokemonId: number, typeId: number) => {
  await connectDB()
  const pokemonType = await db.get(
    `SELECT * FROM pokemon_type WHERE pokemon_id = ? AND type_id = ?`,
    pokemonId,
    typeId
  )
  if (pokemonType) return

  await db.run(
    "INSERT INTO pokemon_type (pokemon_id, type_id) VALUES (?, ?)",
    pokemonId,
    typeId
  )
}

export const insertPokemonInEvolutionChain = async (params: {
  pokemonId: number
  chainId?: number
  stage: number
}) => {
  await connectDB()

  const evolution = await db.get(
    `SELECT * FROM evolutions WHERE pokemon_id = ? AND chain_id = ?`,
    params.pokemonId,
    params.chainId
  )

  if (evolution) return

  await db.run(
    "INSERT INTO evolutions (pokemon_id, chain_id, stage) VALUES (?, ?, ?)",
    params.pokemonId,
    params.chainId,
    params.stage
  )
}

export const getAll = async (options?: {
  filter?: { liked?: boolean }
  limit?: number
  offset?: number
}) => {
  await connectDB()

  const { limit = 20, offset = 0 } = options || {}
  const whereClause = options?.filter?.liked ? "WHERE like = 1" : ""
  const results = await db.all<DBPokemon[]>(
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
    ${whereClause}
    GROUP BY pokemon.id, pokemon.name, pokemon.like
    LIMIT ? OFFSET ?`,
    limit,
    offset
  )

  const pokemons = results.map((pokemon) => {
    return {
      ...pokemon,
      types: JSON.parse(pokemon.types) as TypeInfo[],
    }
  })

  return pokemons
}

export const get = async (id: number): Promise<Pokemon> => {
  await connectDB()

  try {
    const data = await db.get<DBPokemon>(
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
      id
    )

    if (!data) throw Error("Pokemon not found")

    return {
      id: data.id,
      name: data.name,
      like: data.like,
      types: JSON.parse(data.types) as TypeInfo[],
    }
  } catch (e) {
    throw new Error("Error getting pokemon by id", { cause: e })
  }
}

export const getEvolutionChainByPokemonId = async (id: number) => {
  await connectDB()

  try {
    const chain = await db.all<
      {
        chainId: number
        stage: number
        pokemon_id: number
        name: string
        types: string
        like: boolean
      }[]
    >(
      `SELECT 
        evolutions.pokemon_id, 
        evolutions.chain_id, 
        evolutions.stage, 
        pokemon.name,
        pokemon.like,
        (
          SELECT json_group_array(
            json_object('id', type.id, 'name', type.name)
          ) as types
          FROM pokemon_type 
          JOIN type 
            ON pokemon_type.type_id = type.id
          WHERE pokemon_type.pokemon_id = evolutions.pokemon_id
          GROUP BY pokemon_type.pokemon_id
        ) as types
      FROM evolutions 
      JOIN pokemon 
        ON evolutions.pokemon_id = pokemon.id
      WHERE chain_id = (SELECT chain_id FROM evolutions WHERE pokemon_id = ?)
      ORDER BY stage ASC`,
      id
    )

    return chain.map((pokemon) => {
      return {
        id: pokemon.pokemon_id,
        name: pokemon.name,
        types: JSON.parse(pokemon.types) as TypeInfo[],
        stage: pokemon.stage,
        like: pokemon.like,
      }
    })
  } catch (e) {
    throw new Error("Error getting evolution chain by pokemon id", {
      cause: e,
    })
  }
}

export const update = async (pokemon: Pokemon) => {
  const { id, name, like } = pokemon
  await db.run(
    "UPDATE pokemon SET name = ?, like = ? WHERE id = ?",
    name,
    like,
    id
  )
}

await connectDB()
