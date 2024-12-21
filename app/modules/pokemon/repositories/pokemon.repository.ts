import { db } from "~/db"
import { Pokemon } from "~/types/Pokemon"
import { Type } from "~/types/Type"

export type DBPokemonRow = {
  id: number
  name: string
  like: number
  types: string
}

export const createPokemon = (pokemon: Pokemon): Pokemon => {
  db.prepare<[number, string, number]>(
    "INSERT INTO pokemon (id, name, like) VALUES (?, ?, ?)"
  ).run(pokemon.id, pokemon.name, pokemon.like ? 1 : 0)

  return pokemon
}

export const getPokemonById = (id: number) => {
  const data = db
    .prepare<number, DBPokemonRow>(
      `SELECT 
        pokemon.id, 
        pokemon.name, 
        pokemon.like, 
        json_group_array(
          json_object('id', types.id, 'name', types.name)
        ) as types
      FROM pokemon 
      LEFT JOIN pokemon_types 
        ON pokemon.id = pokemon_types.pokemon_id
      LEFT JOIN types 
        ON pokemon_types.type_id = types.id
      WHERE pokemon.id = ?
      GROUP BY pokemon.id, pokemon.name, pokemon.like
    `
    )
    .get(id)

  return data ? mapPokemonRowToPokemon(data) : data
}

export const getAllPokemon = (options?: {
  filter?: { like?: boolean }
  limit?: number
  offset?: number
}) => {
  const { limit = 20, offset = 0 } = options || {}
  const whereClause =
    typeof options?.filter?.like === "undefined"
      ? ""
      : `WHERE like = ${options.filter.like ? 1 : 0}`

  const results = db
    .prepare<[number, number], DBPokemonRow>(
      `SELECT 
      pokemon.id, 
      pokemon.name, 
      pokemon.like, 
      json_group_array(
        json_object('id', types.id, 'name', types.name)
      ) as types
    FROM pokemon 
    LEFT JOIN pokemon_types 
      ON pokemon.id = pokemon_types.pokemon_id
    LEFT JOIN types
      ON pokemon_types.type_id = types.id
    ${whereClause}
    GROUP BY pokemon.id, pokemon.name, pokemon.like
    LIMIT ? OFFSET ?`
    )
    .all(limit, offset)

  return results.map(mapPokemonRowToPokemon)
}

export const removePokemonTypes = (id: number) => {
  db.prepare<number>(
    `
    DELETE pokemon_types
    WHERE pokemon_id = ?
  `
  ).run(id)
}

export const addPokemonType = (id: number, type: Type) => {
  db.prepare<[number, number]>(
    `
    INSERT INTO pokemon_types (pokemon_id, type_id) VALUES(?, ?)
  `
  ).run(id, type.id)
}

export const updatePokemonTypes = (id: number, types: Type[]) => {
  removePokemonTypes(id)

  types.forEach((type) => {
    addPokemonType(id, type)
  })
}

export const updatePokemon = (
  id: number,
  pokemon: Partial<Pokemon>
): Pokemon => {
  const existing = getPokemonById(id)
  if (!existing) throw new Error(`couldn't find pokemon: ${id}`)

  const params = {
    name: pokemon.name ?? existing.name,
    like: pokemon.like ?? existing.like ? 1 : 0,
  }

  db.prepare<[string, number, number]>(
    `
    UPDATE pokemon
    SET 
      name = ?,
      like = ?
    WHERE id = ?
  `
  ).run(params.name, params.like, id)

  return {
    ...existing,
    ...pokemon,
  }
}

const mapPokemonRowToPokemon = (data: DBPokemonRow): Pokemon => {
  return {
    id: data.id,
    name: data.name,
    like: Boolean(data.like),
    types: JSON.parse(data.types) as Type[],
  }
}
