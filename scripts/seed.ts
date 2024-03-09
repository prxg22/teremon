import fs from 'fs'

import PokeAPI from 'pokedex-promise-v2'

import { seed } from '../app/infra/repository/pokemon'
import type { Pokemon } from '../app/models/Pokemon'

const pokedex = new PokeAPI()

const runSeed = async () => {
  const pokemons = await getPokemonFromDump()

  await seed({ pokemons })
}

const runScrapper = async (options: { offset: number; limit: number }) => {
  const pokemons = await getPokemonFromAPI(options)

  fs.writeFileSync('pokemon-dump.json', JSON.stringify(pokemons, null, 2))
}

const createPokemon = (pokemon: PokeAPI.Pokemon): Pokemon => {
  return {
    id: pokemon.id,
    name: pokemon.name,
    like: false,
    types: pokemon.types.map(({ slot, type }) => ({
      id: slot,
      name: type.name,
    })),
  }
}

const getPokemonFromAPI = async (options: {
  offset: number
  limit: number
}) => {
  let { results } = await pokedex.getPokemonsList({
    cacheLimit: 20000,
    limit: options.limit,
    offset: options.offset,
  })

  const pokemons = await Promise.all(
    results.map(async ({ name }) => {
      return pokedex.getPokemonByName(name)
    }),
  )

  return pokemons
}

const getPokemonFromDump = async () => {
  const { default: pokemon } = await import('../pokemon-dump.json')

  return (pokemon as PokeAPI.Pokemon[]).map(createPokemon)
}

runSeed()
  // runScrapper({
  //   offset: 1000,
  //   limit: 25,
  // })
  .then(() => {
    process.exit(0)
  })
