import { GetPokemonDto } from "../dtos/getPokemon.dto"
import { getPokemonEvolutionsChain } from "../services/evolutions.service"

export const getPokemonEvolutionsChainHandler = (dto: GetPokemonDto) => {
  const evolutions = getPokemonEvolutionsChain(dto)

  return evolutions
}
