import fs, { createWriteStream } from "fs"

import { writeReadableStreamToWritable } from "@react-router/node"
import PokeAPI from "pokedex-promise-v2"
import { listPokemon } from "~/modules/pokemon/services/pokemon.service"

const pokedex = new PokeAPI()

export interface DumpedPokemon extends PokeAPI.Pokemon {
  like: boolean
}

const mode = process.argv[2] // 'pokemon' | 'evoultion' | 'sprite'
const offset = process.argv[3] ? parseInt(process.argv[3], 10) : 0 // offset
const limit = process.argv[4] ? parseInt(process.argv[4], 10) : 20 // limit
const path = process.argv[5] ?? "./scripts/.dump/" + mode

const dumpPokemon = async (options: { offset: number; limit: number }) => {
  const pokemons = await getPokemonsFromAPI(options)

  const liked = listPokemon({ filter: { like: true } })

  return pokemons.map((p) => ({
    ...p,
    like: liked.some((l) => l.id === p.id),
  }))
}

const dumpEvolutions = async (options: { offset: number; limit: number }) => {
  const chainsList = await pokedex.getEvolutionChainsList({
    cacheLimit: 20000,
    limit: options.limit,
    offset: options.offset,
  })

  console.log(`Fetched ${chainsList.results.length} evolution chains`)

  const chains = chainsList.results.map(async ({ url }) => {
    const chain = (await pokedex.getResource(url)) as PokeAPI.EvolutionChain
    const ec = await unrollEvolutionChain(chain.chain)
    return ec.map((c) => ({ ...c, chainId: chain.id }))
  })

  console.log("Dumping evolutions...")

  return Promise.all(chains)
}

const getPokemonsFromAPI = async (options: {
  offset: number
  limit: number
}): Promise<DumpedPokemon[]> => {
  const { results } = await pokedex.getPokemonsList({
    cacheLimit: 20000,
    limit: options.limit,
    offset: options.offset,
  })

  console.log(`Fetched ${results.length} pokemons`)

  return Promise.all(
    results.map(async (result) => {
      const pokemon = await pokedex.getPokemonByName(result.name)

      return {
        ...pokemon,
        like: false,
      }
    })
  )
}

const unrollEvolutionChain = async (
  chain: PokeAPI.Chain,
  stage: number = 0
): Promise<{ pokemonId: number; stage: number }[]> => {
  const species = await pokedex.getPokemonSpeciesByName(chain.species.name)
  const pokemon = await Promise.all(
    species.varieties.map(async (v) => {
      const p = await pokedex.getPokemonByName(v.pokemon.name)
      return {
        pokemonId: p.id,
        stage,
      }
    })
  )

  if (chain.evolves_to.length > 0) {
    const unrolled = await Promise.all(
      chain.evolves_to?.map(async (c) => {
        return unrollEvolutionChain(c, stage + 1)
      })
    ).then((chains) => chains.flat())

    pokemon.push(...unrolled)
  }

  return pokemon
}

const downloadImage = async (id: number, path: string) => {
  const url = new URL(
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/`
  )

  url.pathname += `${id}.png`

  const response = await fetch(url.toString())

  if (!response.body || !response.ok) {
    throw new Error("Failed to download image")
  }

  // create file if not exists
  const fd = createWriteStream(path, {
    flags: "w",
  })

  const { body } = response
  return writeReadableStreamToWritable(body, fd)
}

export const downloadAllImages = async (options: {
  offset: number
  limit: number
}) => {
  for (let i = options.offset; i <= options.offset + options.limit; i++) {
    try {
      await downloadImage(i, path + `/${i}.png`)
    } catch (err) {
      console.error(`Failed to download image for pokemon ${i}`)
      console.error(err)
    }
  }
}

const run = async () => {
  if (!fs.existsSync(path)) {
    const segments = path.split("/")

    for (let i = 0; i < segments.length; i++) {
      const subpath = segments.slice(0, i + 1).join("/")
      if (!fs.existsSync(subpath)) {
        fs.mkdirSync(subpath)
      }
    }
  }

  if (mode === "pokemon") {
    return dumpPokemon({
      offset,
      limit,
    })
  }

  if (mode === "evolution") {
    return dumpEvolutions({
      offset,
      limit,
    })
  }

  if (mode === "sprite") {
    return downloadAllImages({
      offset,
      limit,
    })
  }

  throw new Error(`Invalid mode. Use 'pokemon' , 'evolution' or 'sprite'`)
}

run()
  .then((result) => {
    if (!result) return
    const timestamp = new Date().toISOString().replace(/:/g, "-")

    console.log("Dumping result...")

    fs.writeFileSync(
      `${path}/${timestamp}.json`,
      JSON.stringify(result, null, 2)
    )
    console.log("Dumped!")
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
