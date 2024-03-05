import type { LoaderFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { Form, Link, useLoaderData, useNavigate } from '@remix-run/react'

import { get, toogleLike } from '../services/pokemon.server'

export const loader = async (loaderArgs: LoaderFunctionArgs) => {
  const { params } = loaderArgs
  const { pokemonId } = params

  if (!pokemonId) redirect('/pokemon')

  const pokemon = await get(pokemonId)

  return { pokemon }
}

export const action = async ({ params }: LoaderFunctionArgs) => {
  const { pokemonId } = params
  if (!pokemonId) return

  toogleLike(Number(pokemonId))

  return null
}
const PokemonPage = () => {
  const navigate = useNavigate()
  const loaderData = useLoaderData<typeof loader>()
  return (
    <div className="flex-1 flex flex-col overflow p-2 bg-gradient-to-br from-pink-500 via-purple-500 to-green-500 rounded-md animate-glowing">
      <header className="flex self-stretch mb-3 ">
        <Link
          to="#"
          onClick={(event) => {
            event.preventDefault()
            navigate(-1)
          }}
          className="bg-purple-600 text-white p-2 rounded-full w-[32px] h-[32px] text-sm drop-shadow-lg"
        >
          ⬅
        </Link>
      </header>
      <section className="flex gap-4">
        <img
          src={loaderData.pokemon.sprites.front_default || ''}
          alt={loaderData.pokemon.name}
          className="pokemon__sprites w-[150px] p-1 border-2 bg-gray-50 border-zinc-900 rounded-md flex items-center justify-center "
        />
        <h1 className="pokemon__name">{loaderData.pokemon.name}</h1>
        <Form method="post">
          <button>{loaderData.pokemon.like ? '💜' : '🤍'}</button>
        </Form>
      </section>
    </div>
  )
}

export default PokemonPage
