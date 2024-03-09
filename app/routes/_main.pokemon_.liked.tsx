import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'

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

  return json({
    pokemons: pokemons.filter((pokemon) => {
      return pokemon.like
    }),
  })
}

const Index = () => {
  const loaderData = useLoaderData<typeof loader>()
  return (
    <>
      <div className="flex-1 flex flex-col items-center overflow p-2 bg-gradient-to-br from-pink-500 via-purple-500 to-green-500 rounded-md animate-glowing">
        <header className="flex self-stretch mb-3">
          <Link
            to="/pokemon"
            className="bg-purple-600 text-white p-2 rounded-full w-[32px] h-[32px] text-sm drop-shadow-lg"
          >
            🏠
          </Link>
        </header>
        <ul className="grid grid-cols-3 grid-rows-flow gap-3 overflow-auto list-none w-full justify-center items-center">
          {loaderData.pokemons.map((pokemon) => (
            <li key={pokemon.name}>
              <PokemonCard pokemon={pokemon} />
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export default Index
