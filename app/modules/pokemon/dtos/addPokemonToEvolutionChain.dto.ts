import { z } from "zod"

export const addPokemonToEvolutionChainSchema = z.object({
  chainId: z.coerce.number().min(1),
  pokemonId: z.coerce.number().min(1),
  stage: z.coerce.number().min(0),
})

export type AddPokemonToEvolutionChainDto = z.infer<
  typeof addPokemonToEvolutionChainSchema
>
