import { data } from "react-router"
import { Route } from ".react-router/types/app/routes/pokemon/+types/id"
import { getPokemonSchema } from "../dtos/getPokemon.dto"
import { getPokemonHandler } from "../handlers/getPokemon.handler"
import { getPokemonEvolutionsChainHandler } from "../handlers/getPokemonEvolutionsChain.handler"

export const getPokemonController = (loaderArgs: Route.LoaderArgs) => {
  const params = { id: loaderArgs.params.pokemonId }

  const parseResult = getPokemonSchema.safeParse(params)

  if (!parseResult.success) {
    throw data(
      {
        errors: parseResult.error.issues,
      },
      {
        status: 400,
      }
    )
  }

  const pokemon = getPokemonHandler(parseResult.data)
  if (!pokemon)
    throw data(
      {
        errors: [`Could not find pokemon: ${params.id}`],
      },
      {
        status: 400,
      }
    )

  const evolutions = getPokemonEvolutionsChainHandler(parseResult.data)

  return {
    pokemon,
    evolutions,
  }
}
