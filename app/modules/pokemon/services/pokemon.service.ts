import { CreatePokemonDto } from "../dtos/createPokemon.dto"
import * as pokemonRepository from "~/modules/pokemon/repositories/pokemon.repository"
import { getOrCreateTypes } from "./types.service"
import { ListPokemonDto } from "../dtos/listPokemon.dto"
import { GetPokemonDto } from "../dtos/getPokemon.dto"
import { UpdatePokemonDto } from "../dtos/updatePokemon.dto"
import { getPokemonById } from "~/modules/pokemon/repositories/pokemon.repository"

export const createPokemon = (dto: CreatePokemonDto) => {
  const existing = getPokemonById(dto.id)
  if (existing) return existing

  const params = {
    ...dto,
    like: dto.like ?? false,
    types: getOrCreateTypes(dto.types),
  }

  const pokemon = pokemonRepository.createPokemon(params)

  params.types.map((type) => {
    pokemonRepository.addPokemonType(pokemon.id, type)
  })

  return pokemon
}

export const listPokemon = (dto: ListPokemonDto) => {
  return pokemonRepository.getAllPokemon(dto)
}

export const getPokemon = (dto: GetPokemonDto) => {
  return pokemonRepository.getPokemonById(dto.id)
}

export const updatePokemon = (dto: UpdatePokemonDto) => {
  const types = dto.types ? getOrCreateTypes(dto.types) : undefined
  const pokemon = pokemonRepository.updatePokemon(dto.id, { ...dto, types })

  if (types) {
    pokemonRepository.updatePokemonTypes(dto.id, types)
  }

  return pokemon
}
