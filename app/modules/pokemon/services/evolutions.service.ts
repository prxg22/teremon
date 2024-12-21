import {
  addEvolutionToChain,
  getEvolution,
  getEvolutionsByPokemonId,
} from "../repositories/evolutions.repository"
import { GetPokemonDto } from "../dtos/getPokemon.dto"
import { AddPokemonToEvolutionChainDto } from "../dtos/addPokemonToEvolutionChain.dto"
import { getPokemon } from "./pokemon.service"

export const getPokemonEvolutionsChain = (dto: GetPokemonDto) => {
  return getEvolutionsByPokemonId(dto.id)
}

export const addPokemonToEvolutionsChain = (
  dto: AddPokemonToEvolutionChainDto
) => {
  const pokemon = getPokemon({ id: dto.pokemonId })
  if (!pokemon) throw new Error(`could not find pokemon ${dto.pokemonId}`)

  const existing = getEvolution(dto.chainId, dto.pokemonId)
  if (existing) return existing

  addEvolutionToChain(dto.chainId, dto.pokemonId, dto.stage)
}
