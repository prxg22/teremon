import { listPokemonSchema } from "../dtos/listPokemon.dto"
import { data } from "react-router"
import { listPokemonHandler } from "../handlers/listPokemon.handler"
import { Route } from ".react-router/types/app/routes/pokemon/+types/list"

export const listPokemonController = async (loaderArgs: Route.LoaderArgs) => {
  const url = new URL(loaderArgs.request.url)

  const params = {
    offset: url.searchParams.get("offset"),
    limit: 200000,
  }

  const parseResult = await listPokemonSchema.safeParseAsync(params)

  if (parseResult.error) {
    throw data(
      { errors: parseResult.error.issues },
      {
        status: 400,
      }
    )
  }

  return listPokemonHandler(parseResult.data)
}
