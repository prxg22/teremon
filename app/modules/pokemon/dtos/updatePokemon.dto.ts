import { z } from "zod"
import { castStringToBoolean } from "~/utils"

export const updatePokemonSchema = z.object({
  id: z.coerce.number().min(1),
  name: z.string().optional(),
  like: castStringToBoolean.optional(),
  types: z.array(z.string()).optional(),
})

export type UpdatePokemonDto = z.infer<typeof updatePokemonSchema>
