import { z } from "zod"
import { castStringToBoolean } from "~/utils"

export const createPokemonSchema = z.object({
  id: z.coerce.number().min(1),
  name: z.string(),
  like: castStringToBoolean.optional(),
  types: z.array(z.string()),
})

export type CreatePokemonDto = z.infer<typeof createPokemonSchema>
