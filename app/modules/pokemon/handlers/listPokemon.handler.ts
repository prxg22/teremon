import { type ListPokemonDto } from "../dtos/listPokemon.dto"
import { listPokemon } from "../services/pokemon.service"

export const listPokemonHandler = (dto: ListPokemonDto) => {
  return listPokemon(dto)
}
