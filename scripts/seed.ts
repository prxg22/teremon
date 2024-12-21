import fs from "fs/promises"

import "~/db"

import type { DumpedPokemon } from "./scrapper"
import { addPokemonToEvolutionsChain } from "~/modules/pokemon/services/evolutions.service"
import { addPokemonToEvolutionChainSchema } from "~/modules/pokemon/dtos/addPokemonToEvolutionChain.dto"
import { createPokemon } from "~/modules/pokemon/services/pokemon.service"
import {
  CreatePokemonDto,
  createPokemonSchema,
} from "~/modules/pokemon/dtos/createPokemon.dto"

const mode = process.argv[2] // 'pokemon' | 'evoultion
const path = process.argv[3] ?? "./scripts/.dump/" + mode

export const seedPokemon = async (seed?: { pokemons?: CreatePokemonDto[] }) => {
  if (!seed?.pokemons?.length) return

  for (const pokemon of seed.pokemons) {
    createPokemonSchema.parse(pokemon)
    createPokemon(pokemon)
  }
}

export const seedEvolution = async (seed?: {
  evolutions?: { chainId: number; stage: number; pokemonId: number }[][]
}) => {
  if (!seed?.evolutions?.length) return

  for (const chain of seed.evolutions) {
    for (const evo of chain) {
      addPokemonToEvolutionChainSchema.parse(evo)
      addPokemonToEvolutionsChain(evo)
    }
  }
}

const parsePokemon = (pokemon: DumpedPokemon): CreatePokemonDto => {
  return {
    id: pokemon.id,
    name: pokemon.name,
    like: pokemon.like,
    types: pokemon.types.map(({ type }) => type.name),
  }
}

const getPokemonFromDump = async () => {
  const dumps = await fs.readdir(path)

  if (!dumps.length) {
    throw new Error("No dump file found")
  }

  const pokemons: CreatePokemonDto[] = []

  for (const dump of dumps) {
    const dumpFile = await fs.readFile(`${path}/${dump}`, "utf-8")
    const data = JSON.parse(dumpFile).map(parsePokemon)
    pokemons.push(...data)
  }

  return pokemons
}

const getEvolutionsFromDump = async () => {
  const dumps = await fs.readdir(path)

  if (!dumps.length) {
    throw new Error("No dump file found")
  }

  const evolutions = []
  for (const dump of dumps) {
    const dumpFile = await fs.readFile(`${path}/${dump}`, "utf-8")

    evolutions.push(...JSON.parse(dumpFile))
  }

  return evolutions
}

const run = async () => {
  if (mode === "pokemon") {
    const pokemons = await getPokemonFromDump()

    return seedPokemon({ pokemons })
  }

  if (mode === "evolution") {
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
