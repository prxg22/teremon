import { data } from "react-router"
import { Route } from ".react-router/types/app/routes/pokemon/+types/id"
import { updatePokemonSchema } from "../dtos/updatePokemon.dto"
import { updatePokemon } from "../services/pokemon.service"

export const updatePokemonLikeController = async (
  actionArgs: Route.ActionArgs
) => {
  const formData = await actionArgs.request.formData()

  const params = {
    id: actionArgs.params.pokemonId,
    like: formData.get("like")?.toString(),
  }

  const parseResult = await updatePokemonSchema.safeParseAsync(params)

  if (parseResult.error) {
    throw data(
      { errors: parseResult.error.issues },
      {
        status: 400,
      }
    )
  }

  return updatePokemon(parseResult.data)
}
