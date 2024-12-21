import fs from 'fs/promises'

import {
  connectDB,
  createEvolutionTable,
  createPokemonTable,
  createPokemonTypeTable,
  createTypeTable,
  insertPokemon,
  insertPokemonInEvolutionChain,
  insertPokemonType,
  insertType,
} from '../app/infra/repository/pokemon'
import type { Pokemon } from '../app/dtos/Pokemon'

import type { DumpedPokemon } from './scrapper'

const mode = process.argv[2] // 'pokemon' | 'evoultion
const path = process.argv[3] ?? './scripts/.dump/' + mode

export const seedPokemon = async (seed?: { pokemons?: Pokemon[] }) => {
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

export const seedEvolution = async (seed?: {
  evolutions?: { chainId: number; stage: number; pokemonId: number }[][]
}) => {
  await connectDB()

  await createEvolutionTable()

  if (!seed?.evolutions?.length) return

  for (const chain of seed.evolutions) {
    for (const evo of chain) {
      await insertPokemonInEvolutionChain(evo)
    }
  }
}

const parsePokemon = (pokemon: DumpedPokemon): Pokemon => {
  return {
    id: pokemon.id,
    name: pokemon.name,
    like: pokemon.like,
    types: pokemon.types.map(({ slot, type }) => ({
      id: slot,
      name: type.name,
    })),
  }
}

const getPokemonFromDump = async () => {
  const dumps = await fs.readdir(path)

  if (!dumps.length) {
    throw new Error('No dump file found')
  }

  const pokemons: DumpedPokemon[] = []
  for (const dump of dumps) {
    const dumpFile = await fs.readFile(`${path}/${dump}`, 'utf-8')

    pokemons.push(...JSON.parse(dumpFile))
  }

  return pokemons.map(parsePokemon)
}

const getEvolutionsFromDump = async () => {
  const dumps = await fs.readdir(path)

  if (!dumps.length) {
    throw new Error('No dump file found')
  }

  const evolutions = []
  for (const dump of dumps) {
    const dumpFile = await fs.readFile(`${path}/${dump}`, 'utf-8')

    evolutions.push(...JSON.parse(dumpFile))
  }

  return evolutions
}

const run = async () => {
  if (mode === 'pokemon') {
    const pokemons = await getPokemonFromDump()

    return seedPokemon({ pokemons })
  }

  if (mode === 'evolution') {
    const evolutions = await getEvolutionsFromDump()

    return seedEvolution({ evolutions })
  }

  throw new Error(`Invalid mode. Use 'pokemon' or 'evolution'`)
}

run()
  .then(() => {
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
