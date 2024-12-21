import { z } from "zod"

export const getPokemonSchema = z.object({
  id: z.coerce.number().min(1),
})

export type GetPokemonDto = z.infer<typeof getPokemonSchema>
