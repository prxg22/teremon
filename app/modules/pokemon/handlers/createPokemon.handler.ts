import { type CreatePokemonDto } from "../dtos/createPokemon.dto"
import { createPokemon } from "../services/pokemon.service"

export const createPokemonHandler = (dto: CreatePokemonDto) => {
  return createPokemon(dto)
}
