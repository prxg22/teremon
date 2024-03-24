import fs from 'fs/promises'

import {
  connectDB,
  createEvolutionsTable,
  createPokemonTable,
  createPokemonTypeTable,
  createTypeTable,
  insertPokemon,
  insertPokemonEvolutions,
  insertPokemonType,
  insertType,
} from '../app/infra/repository/pokemon'
import type { Pokemon } from '../app/models/Pokemon'

import type { DumpedPokemon } from './scrapper'

const dumpDir = './scripts/.dump'
export const seed = async (seed?: { pokemons?: Pokemon[] }) => {
  await connectDB()

  await Promise.all([
    createPokemonTable(),
    createTypeTable(),
    createPokemonTypeTable(),
    createEvolutionsTable(),
  ])

  if (!seed?.pokemons?.length) return

  for (const pokemon of seed.pokemons) {
    await insertPokemon(pokemon)
    for (const t of pokemon.types) {
      const type = await insertType(t)
      await insertPokemonType(pokemon.id, type.id)
    }
    for (const e of pokemon.evolutions) {
      if (e?.id && e.id !== pokemon.id && e.id <= 1025)
        await insertPokemonEvolutions(e.id, pokemon.id)
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
    evolutions:
      pokemon.evolutions?.map((id) => ({
        id,
      })) || [],
  }
}

const getPokemonFromDump = async () => {
  const dumps = await fs.readdir(dumpDir)

  if (!dumps.length) {
    throw new Error('No dump file found')
  }

  const pokemons: DumpedPokemon[] = []
  for (const dump of dumps) {
    const dumpFile = await fs.readFile(`${dumpDir}/${dump}`, 'utf-8')

    pokemons.push(...JSON.parse(dumpFile))
  }

  return pokemons.map(parsePokemon)
}

const run = async () => {
  const pokemons = await getPokemonFromDump()

  await seed({ pokemons })
}

run()
  .then(() => {
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
