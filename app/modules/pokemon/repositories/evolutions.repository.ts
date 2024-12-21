import { db } from "~/db"
import { Pokemon } from "~/types/Pokemon"

type DBEvolutionRow = {
  pokemon_id: number
  chain_id: number
  stage: number
  pokemon: string
}

export const addEvolutionToChain = (
  chainId: number,
  pokemonId: number,
  stage: number
) => {
  db.prepare<[number, number, number]>(
    `
    INSERT INTO evolutions (chain_id, pokemon_id, stage) VALUES (?, ?, ?)
  `
  ).run(chainId, pokemonId, stage)
}

export const getEvolution = (chainId: number, pokemonId: number) => {
  const evolution = db
    .prepare<[number, number], DBEvolutionRow>(
      `SELECT 
    evolutions.pokemon_id, 
    evolutions.chain_id, 
    evolutions.stage, 
    json_object(
      'id', pokemon.id,
      'name', pokemon.name,
      'like', pokemon.like,
      'types', json_array(
        json_object(
          'id', types.id,
          'name', types.name
        )
      )
    ) as pokemon
  FROM evolutions 
  JOIN pokemon 
    ON evolutions.pokemon_id = pokemon.id
  LEFT JOIN pokemon_types
    ON pokemon_types.pokemon_id = pokemon.id
  LEFT JOIN types
    ON types.id = pokemon_types.type_id
  WHERE evolutions.chain_id = ? and evolutions.pokemon_id = ?
  GROUP BY 
    evolutions.pokemon_id,
    evolutions.chain_id,
    evolutions.stage,
    pokemon.id,
    pokemon.name,
    pokemon.like
  ORDER BY stage ASC
  `
    )
    .get(chainId, pokemonId)

  return mapDBEvolutionRowToEvolution(evolution)
}

export const getEvolutionsByChainId = (chainId: number) => {
  const evolutions = db
    .prepare<number, DBEvolutionRow>(
      `SELECT 
    evolutions.pokemon_id, 
    evolutions.chain_id, 
    evolutions.stage, 
    json_object(
      'id', pokemon.id,
      'name', pokemon.name,
      'like', pokemon.like,
      'types', json_array(
        json_object(
          'id', types.id,
          'name', types.name
        )
      )
    ) as pokemon
  FROM evolutions 
  JOIN pokemon 
    ON evolutions.pokemon_id = pokemon.id
  JOIN pokemon_types
    ON pokemon_types.pokemon_id = pokemon.id
  JOIN types
    ON types.id = pokemon_types.type_id
  WHERE chain_id = ?
  GROUP BY 
    evolutions.pokemon_id,
    evolutions.chain_id,
    evolutions.stage,
    pokemon.id,
    pokemon.name,
    pokemon.like
  ORDER BY stage ASC
  `
    )
    .all(chainId)

  return evolutions.map(mapDBEvolutionRowToEvolution)
}

export const getEvolutionsByPokemonId = (pokemonId: number) => {
  const evolutions = db
    .prepare<number, DBEvolutionRow>(
      `SELECT 
    evolutions.pokemon_id, 
    evolutions.chain_id, 
    evolutions.stage, 
    json_object(
      'id', pokemon.id,
      'name', pokemon.name,
      'like', pokemon.like,
      'types', json_array(
        json_object(
          'id', types.id,
          'name', types.name
        )
      )
    ) as pokemon
  FROM evolutions 
  JOIN pokemon 
    ON evolutions.pokemon_id = pokemon.id
  JOIN pokemon_types
    ON pokemon_types.pokemon_id = pokemon.id
  JOIN types
    ON types.id = pokemon_types.type_id
  WHERE chain_id = (SELECT chain_id FROM evolutions WHERE pokemon_id = ?)
  GROUP BY 
    evolutions.pokemon_id,
    evolutions.chain_id,
    evolutions.stage,
    pokemon.id,
    pokemon.name,
    pokemon.like
  ORDER BY stage ASC
  `
    )
    .all(pokemonId)

  return evolutions.map(mapDBEvolutionRowToEvolution)
}

const mapDBEvolutionRowToEvolution = (data?: DBEvolutionRow) => {
  if (!data) return undefined

  return {
    pokemonId: data.pokemon_id,
    chainId: data.chain_id,
    stage: data.stage,
    pokemon: JSON.parse(data.pokemon) as Pokemon,
  }
}
