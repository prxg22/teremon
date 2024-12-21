import { NavLink } from "react-router"

import { PokemonCard } from "~/components/PokemonCard"
import type { Route } from "./+types/list"
import { listPokemonController } from "~/modules/pokemon/controllers/listPokemon.controller"

export const loader = async (loaderArgs: Route.LoaderArgs) => {
  const pokemon = await listPokemonController(loaderArgs)
  return { pokemon }
}

const Index = ({ loaderData }: Route.ComponentProps) => {
  return (
    <>
      <div className="p-4 flex justify-center">
        <ul className="grid xl:lg:grid-cols-6 md:sm:grid-cols-3 grid-cols-1 gap-6 p-4">
          {loaderData.pokemon.map((pokemon) => (
            <li key={pokemon.name}>
              <NavLink
                to={`/pokemon/${pokemon.id}`}
                viewTransition
                prefetch="intent"
              >
                <PokemonCard pokemon={pokemon} />
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export default Index
