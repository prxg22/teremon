import { data } from "react-router"
import { Route } from ".react-router/types/app/routes/pokemon/+types/id"
import { getPokemonSchema } from "../dtos/getPokemon.dto"
import { getPokemon } from "../services/pokemon.service"
import { getPokemonEvolutionsChain } from "../services/evolutions.service"

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

  const pokemon = getPokemon(parseResult.data)
  if (!pokemon)
    throw data(
      {
        errors: [`Could not find pokemon: ${params.id}`],
      },
      {
        status: 400,
      }
    )

  const evolutions = getPokemonEvolutionsChain(parseResult.data)

  return {
    pokemon,
    evolutions,
  }
}
