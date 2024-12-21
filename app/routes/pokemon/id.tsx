import { Form, Link } from "react-router"
import type { Route } from "./+types/id"
// import { toogleLike } from "~/services/pokemon.server"

import { PokemonCard } from "~/components/PokemonCard"
import { derivateColorFromTypes } from "~/utils"
import { getPokemonController } from "~/modules/pokemon/controllers/getPokemon.controller"
import { updatePokemonLikeController } from "~/modules/pokemon/controllers/updatePokemonLike.controller"

export const loader = async (loaderArgs: Route.LoaderArgs) => {
  const { pokemon, evolutions } = getPokemonController(loaderArgs)

  return { pokemon, evolutions }
}

export const action = async (actionArgs: Route.ActionArgs) => {
  await updatePokemonLikeController(actionArgs)

  return null
}

const PokemonPage = ({ loaderData }: Route.ComponentProps) => {
  const color = derivateColorFromTypes(loaderData.pokemon.types)

  const iconSrc = loaderData.pokemon.like
    ? "/pokeball-c-icon.png"
    : "/pokeball-b-icon.png"

  const prefetchers = Array.from({ length: 20 }, (_, i) => {
    const href1 =
      loaderData.pokemon.id - i > 0
        ? `/sprites/${loaderData.pokemon.id - i}.png`
        : ""
    const href2 =
      loaderData.pokemon.id + i < 1025
        ? `/sprites/${loaderData.pokemon.id + i}.png`
        : ""

    return (
      <>
        {href1 && (
          <link
            key={`prefetch-${i - loaderData.pokemon.id}`}
            rel="prefetch"
            href={href1}
            as="image"
            crossOrigin="anonymous"
          />
        )}
        {href2 && (
          <link
            key={`prefetch-${i + loaderData.pokemon.id}`}
            rel="prefetch"
            href={href2}
            as="image"
            crossOrigin="anonymous"
          />
        )}
      </>
    )
  })

  const stages = loaderData.evolutions.reduce((acc, curr) => {
    if (acc[curr.stage]) {
      acc[curr.stage].push(curr)
    } else {
      acc[curr.stage] = [curr]
    }
    return acc
  }, {} as Record<number, typeof loaderData.evolutions>)

  return (
    <div
      className={`flex-1 flex flex-col bg-gradient-to-br ${color} p-2 sm:p-4 items-center`}
    >
      <header className="flex self-stretch mb-3 ">
        <Link
          to="/pokemon"
          viewTransition
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
              <img
                src={iconSrc}
                alt="like"
                className="pokemon__like-button w-8 h-8"
              />
            </button>
          </Form>
        </div>
        <img
          src={`/sprites/${loaderData.pokemon.id}.png` || ""}
          alt={loaderData.pokemon.name}
          className="pokemon__sprites w-[300px] p-1 rounded-md flex items-center justify-self-center"
        />
      </section>

      <section className="grid grid-flow-col gap-4 max-w-[75%] justify-center">
        {Object.entries(stages).map(([stage, evolutions]) => (
          <div key={stage} className="flex flex-col gap-4">
            {evolutions.map((evolution) => (
              <Link
                to={`/pokemon/${evolution.pokemonId}`}
                key={"ev-" + evolution.pokemonId}
              >
                <PokemonCard pokemon={evolution.pokemon} />
              </Link>
            ))}
          </div>
        ))}
      </section>
      {prefetchers}
    </div>
  )
}

export default PokemonPage
