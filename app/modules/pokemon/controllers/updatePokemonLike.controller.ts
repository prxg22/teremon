import { data } from "react-router"
import { Route } from ".react-router/types/app/routes/pokemon/+types/id"
import { updatePokemonSchema } from "../dtos/updatePokemon.dto"
import { updatePokemonHandler } from "../handlers/updatePokemon.handler"

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

  console.log(params, parseResult.data)
  return updatePokemonHandler(parseResult.data)
}
