import { UpdatePokemonDto } from "../dtos/updatePokemon.dto"
import { updatePokemon } from "../services/pokemon.service"

export const updatePokemonHandler = (dto: UpdatePokemonDto) => {
  return updatePokemon(dto)
}
