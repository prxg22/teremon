import * as pokemonRepository from '../infra/repository/pokemon'

export const listPokemon = async (options?: {
  limit?: number
  offset?: number
}) => {
  const pokemons = await pokemonRepository.getAll(options)

  return pokemons
}

export const getPokemon = async (id?: number) => {
  if (!id) throw new Error('Pokemon name is required')

  const pokemon = await pokemonRepository.get(id)

  return pokemon
}

export const getEvolutionChain = async (id?: number) => {
  if (!id) throw new Error('Evolution chain id is required')

  const chain = await pokemonRepository.getEvolutionChainByPokemonId(id)

  return chain
}

export const toogleLike = async (id: number) => {
  if (!id) throw new Error('Pokemon id is required')

  const pokemon = await pokemonRepository.get(id)

  pokemon.like = !pokemon.like

  await pokemonRepository.update(pokemon)
  return pokemon
}
