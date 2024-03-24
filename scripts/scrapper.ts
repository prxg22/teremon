import fs from 'fs'

import PokeAPI from 'pokedex-promise-v2'

import { getAll } from '../app/infra/repository/pokemon'

const pokedex = new PokeAPI()

const dir = './scripts/.dump'

export interface DumpedPokemon extends PokeAPI.Pokemon {
  evolutions: number[] | null
  like: boolean
}

const runScrapper = async (options: { offset: number; limit: number }) => {
  let pokemons = await getPokemonsFromAPI(options)

  const timestamp = new Date().toISOString().replace(/:/g, '-')
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }

  console.log('Dumping pokemons...')
  const likes = await getAll({ filter: { liked: true } })

  pokemons = pokemons.map((p) => ({
    ...p,
    like: likes.some((l) => l.id === p.id),
  }))

  fs.writeFileSync(
    `${dir}/${timestamp}.json`,
    JSON.stringify(pokemons, null, 2),
  )
  console.log('Dumped!')
}

const getSpecieEvolutions = async (name: string): Promise<number[] | null> => {
  const specie = await pokedex.getPokemonSpeciesByName(name)

  const evolvesFromUrl = specie.evolves_from_species?.url
  if (!evolvesFromUrl) return null

  const evolvesFrom: PokeAPI.PokemonSpecies =
    await pokedex.getResource(evolvesFromUrl)

  const promises = evolvesFrom.varieties.map((p) =>
    (pokedex.getResource(p.pokemon.url) as Promise<PokeAPI.Pokemon>).then(
      (p) => p.id,
    ),
  )

  return Promise.all(promises)
}

const getPokemonsFromAPI = async (options: {
  offset: number
  limit: number
}): Promise<DumpedPokemon[]> => {
  let { results } = await pokedex.getPokemonsList({
    cacheLimit: 20000,
    limit: options.limit,
    offset: options.offset,
  })

  console.log(`Fetched ${results.length} pokemons`)

  return Promise.all(
    results.map(async (result) => {
      const pokemon = await pokedex.getPokemonByName(result.name)

      const evolutions = await getSpecieEvolutions(pokemon.species.name)

      return {
        ...pokemon,
        like: false,
        evolutions,
      }
    }),
  )
}

const offset = parseInt(process.argv[2], 10) || 0
const limit = parseInt(process.argv[3], 10) || 20

runScrapper({
  offset,
  limit,
})
  .then(() => {
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
