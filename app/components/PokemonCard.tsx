import { useFetcher } from '@remix-run/react'

import type { Pokemon } from '../models/Pokemon'
import { derivateColorFromTypes, lpad } from '../utils'

export const PokemonCard = (props: { pokemon: Pokemon }) => {
  const color = derivateColorFromTypes(props.pokemon.types)

  const fetcher = useFetcher()

  const iconSrc = props.pokemon.like
    ? '/pokeball-c-icon.png'
    : '/pokeball-b-icon.png'

  return (
    <div className={`group cursor-pointer relative`}>
      <div
        className={`absolute -inset-0 p-[2px] bg-gradient-to-tr from-blue-600 via-yellow-500 to-green-600 blur opacity-25 group-hover:opacity-100 transition-all duration-500 rounded-lg`}
      />
      <div
        className={`flex flex-col gap-4 rounded-lg bg-gradient-to-br ${color} text-gray-700 py-4 px-2 min-w-[180px] relative`}
      >
        <div className="flex justify-center items-center gap-1">
          <h3 className="text-xl">#{lpad(props.pokemon.id, 3)}</h3>
          <fetcher.Form
            action={`/pokemon/${props.pokemon.id}`}
            method="post"
            className="absolute right-4"
          >
            <button onClick={(e) => e.stopPropagation()}>
              <img src={iconSrc} alt="like" className="w-7 h-7" />
            </button>
          </fetcher.Form>
        </div>
        <div className="flex flex-col items-center">
          <img
            src={`sprites/${props.pokemon.id}.png`}
            alt={props.pokemon.name}
            className="pokemon-item__sprite w-32 h-32"
            loading="lazy"
          />
          <h2 className="text-2xl pokemon-item__name">{props.pokemon.name}</h2>
        </div>
      </div>
    </div>
  )
}
