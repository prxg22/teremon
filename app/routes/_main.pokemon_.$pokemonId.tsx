import type { LoaderFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { Form, Link, useLoaderData } from '@remix-run/react'

import { get, toogleLike } from '../services/pokemon.server'

import { derivateColorFromTypes } from '~/utils'

export const loader = async (loaderArgs: LoaderFunctionArgs) => {
  const { params } = loaderArgs
  const { pokemonId } = params

  if (!pokemonId) return redirect('/pokemon')

  const pokemon = await get(Number(pokemonId))

  return { pokemon }
}

export const action = async ({ params }: LoaderFunctionArgs) => {
  const { pokemonId } = params
  if (!pokemonId) return

  toogleLike(Number(pokemonId))

  return null
}
const PokemonPage = () => {
  const loaderData = useLoaderData<typeof loader>()
  const color = derivateColorFromTypes(loaderData.pokemon.types)

  const iconSrc = loaderData.pokemon.like
    ? '/pokeball-c-icon.png'
    : '/pokeball-b-icon.png'

  const prefetchers = Array.from({ length: 10 }, (_, i) => {
    if (i <= 5 && i > 1) {
      return (
        <link
          rel="prefetch"
          href={`/sprites/${loaderData.pokemon.id - i}.png`}
          key={`prefetch-${i}`}
        />
      )
    }

    if (i > 5) {
      return (
        <link
          rel="prefetch"
          href={`/sprites/${loaderData.pokemon.id + i}.png`}
          key={`prefetch-${i}`}
        />
      )
    }

    return null
  })

  return (
    <div className={`flex-1 flex flex-col bg-gradient-to-br ${color}`}>
      <header className="flex self-stretch mb-3 ">
        <Link
          to="/pokemon"
          unstable_viewTransition
          className="p-2 rounded-full w-[32px] h-[32px] text-sm drop-shadow-lg"
          prefetch="viewport"
        >
          ⬅
        </Link>
      </header>
      <section className="flex flex-col gap-4 p-4 items-center">
        <div className="flex gap-4">
          <h1 className="pokemon__name text-5xl">{loaderData.pokemon.name}</h1>
          <Form action={`/pokemon/${loaderData.pokemon.id}`} method="post">
            <button onClick={(e) => e.stopPropagation()}>
              <img src={iconSrc} alt="like" className="w-7 h-7" />
            </button>
          </Form>
        </div>
        <img
          src={`/sprites/${loaderData.pokemon.id}.png` || ''}
          alt={loaderData.pokemon.name}
          className="pokemon__sprites w-[300px] p-1 rounded-md flex items-center justify-self-center"
        />
      </section>
      {prefetchers}
    </div>
  )
}

export default PokemonPage
