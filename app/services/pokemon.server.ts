import fs from 'fs/promises'

import PokeAPI from 'pokedex-promise-v2'
const pokedex = new PokeAPI()

export const list = async (options?: { limit?: number; offset?: number }) => {
  const response = await pokedex.getPokemonsList(options)

  const likes = await getLikes()
  const pokemons = response.results.map((pokemon, index) => ({
    ...pokemon,
    id: index + 1,
    like: likes.includes(index + 1),
  }))

  return {
    count: response.count,
    pokemons,
  }
}

export const get = async (name?: string) => {
  if (!name) throw new Error('Pokemon name is required')
  const pokemon = await pokedex.getPokemonByName(name)

  if (!pokemon) throw new Error('Pokemon not found')

  const likes = await getLikes()

  return { ...pokemon, like: likes.includes(pokemon.id) }
}

export const getLikes = async () => {
  const likes = await fs.readFile('pokemon.json')

  if (!likes) return []

  return JSON.parse(likes.toString()) as number[]
}

export const toogleLike = async (id: number) => {
  console.log('toogleLike', id)
  const likes = await getLikes()

  const newLikes = likes.includes(id)
    ? likes.filter((like) => like !== id)
    : [...likes, id]

  await fs.writeFile('pokemon.json', JSON.stringify(newLikes))
}

export const isLiked = async (id: number) => {
  const likes = await getLikes()

  return likes.includes(id)
}
