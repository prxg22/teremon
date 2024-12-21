import { z } from "zod"

export const listPokemonSchema = z.object({
  filter: z
    .object({
      like: z.coerce.boolean().optional(),
    })
    .optional(),
  limit: z.coerce.number().min(1).optional(),
  offset: z.coerce.number().min(0).optional(),
})

export type ListPokemonDto = z.infer<typeof listPokemonSchema>
