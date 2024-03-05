import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Link, NavLink, useFetcher, useLoaderData } from '@remix-run/react'

import { list } from '../services/pokemon.server'

function lpad(value: number, padding: number) {
  var zeroes = new Array(padding + 1).join('0')
  return (zeroes + value).slice(-padding)
}

export const loader = async (loaderArgs: LoaderFunctionArgs) => {
  const url = new URL(loaderArgs.request.url)
  const offset = Number(url.searchParams.get('offset')) || 0

  const params = {
    offset,
    limit: 1025,
  }
  const { pokemons } = await list(params)

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
              <Pokemon {...pokemon} />
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export default Index
function Pokemon(pokemon: {
  name: string
  url: string
  id: number
  like: boolean
}) {
  const fetcher = useFetcher()

  return (
    <>
      <NavLink
        to={`/pokemon/${pokemon.id}`}
        className="flex flex-col gap-2 items-center text-center bg-transparent drop-shadow-sm"
        unstable_viewTransition
      >
        <img
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
          alt={pokemon.name}
          className="pokemon-item__sprite w-[150px] p-1 border-2 bg-gray-50 border-zinc-900 rounded-md flex items-center justify-center "
          loading="lazy"
        />
        <span className="pokemon-item__name text-xs">
          {lpad(pokemon.id, 3)} - {pokemon.name}{' '}
          <fetcher.Form
            action={`/pokemon/${pokemon.id}`}
            method="post"
            className="inline-flex justify-center"
          >
            <button onClick={(e) => e.stopPropagation()}>
              {pokemon.like ? '💜' : '🤍'}
            </button>
          </fetcher.Form>
        </span>
      </NavLink>
    </>
  )
}
