import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { NavLink, useLoaderData } from '@remix-run/react'

import { PokemonCard } from '../components/PokemonCard'
import { list } from '../services/pokemon.server'

export const loader = async (loaderArgs: LoaderFunctionArgs) => {
  const url = new URL(loaderArgs.request.url)
  const offset = Number(url.searchParams.get('offset')) || 0

  const params = {
    offset,
    limit: 1025,
  }

  const pokemons = await list(params)

  return json({ pokemons })
}

const Index = () => {
  const loaderData = useLoaderData<typeof loader>()
  return (
    <>
      <div className="p-4 flex justify-center">
        <ul className="grid xl:lg:grid-cols-6 md:sm:grid-cols-3 grid-cols-2 gap-4 p-4">
          {loaderData.pokemons.map((pokemon) => (
            <li key={pokemon.name}>
              <NavLink
                to={`/pokemon/${pokemon.id}`}
                className="flex flex-col gap-2 items-center text-center bg-transparent drop-shadow-sm"
                unstable_viewTransition
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
