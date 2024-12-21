import { type CreatePokemonDto } from "../dtos/createPokemon.dto"
import { createType, getTypeByName } from "../repositories/types.repository"

export const getOrCreateTypes = (types: CreatePokemonDto["types"]) => {
  return types.map((name) => getTypeByName(name) ?? createType(name))
}
