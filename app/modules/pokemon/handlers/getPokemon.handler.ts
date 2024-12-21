import { GetPokemonDto } from "../dtos/getPokemon.dto"
import { getPokemon } from "../services/pokemon.service"

export const getPokemonHandler = (dto: GetPokemonDto) => {
  const pokemon = getPokemon(dto)

  return pokemon
}
