import { useFetcher } from '@remix-run/react'

import type { Pokemon, Type } from '../models/Pokemon'

const lpad = (n: number, width: number, z = '0') => {
  const nStr = n + ''
  return nStr.length >= width
    ? nStr
    : new Array(width - nStr.length + 1).join(z) + nStr
}

const derivateColorFromTypes = (types: Type[]) => {
  if (types.length === 1) return `bg-poke-${types[0].name}-300`
  return `bg-gradient-to-br from-poke-${types[0].name}-300 to-poke-${types[1].name}-300`
}

export const PokemonCard = (props: { pokemon: Pokemon }) => {
  const color = derivateColorFromTypes(props.pokemon.types)
  console.log({ name: props.pokemon.name, color })
  const fetcher = useFetcher()

  const buttonColor = `bg-poke-blue-300`

  return (
    <div
      className={`flex flex-col gap-4 rounded-lg ${color} text-gray-700 drop-shadow-lg py-4 px-2 min-w-[180px]`}
    >
      <header>
        <h3 className="text-xl">#{lpad(props.pokemon.id, 3)}</h3>
      </header>
      <div className="flex flex-col items-center">
        <img
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${props.pokemon.id}.png`}
          alt={props.pokemon.name}
          className="pokemon-item__sprite"
          loading="lazy"
        />
        <h2 className="text-2xl pokemon-item__name">{props.pokemon.name}</h2>
      </div>
      <div>
        <fetcher.Form
          action={`/pokemon/${props.pokemon.id}`}
          method="post"
          className="flex justify-end"
        >
          <button
            onClick={(e) => e.stopPropagation()}
            className={`bg-poke-${buttonColor}-300 drop-shadow-md rounded-full p-4 text-sm`}
          >
            {props.pokemon.like ? '⭐️' : '☆'}
          </button>
        </fetcher.Form>
      </div>
    </div>
  )
}
// possible colors
// bg-poke-grass-300 from-poke-grass-300 to-poke-grass-300
// bg-poke-fire-300 from-poke-fire-300 to-poke-fire-300
// bg-poke-water-300 from-poke-water-300 to-poke-water-300
// bg-poke-bug-300 from-poke-bug-300 to-poke-bug-300
// bg-poke-normal-300 from-poke-normal-300 to-poke-normal-300
// bg-poke-electric-300 from-poke-electric-300 to-poke-electric-300
// bg-poke-ground-300 from-poke-ground-300 to-poke-ground-300
// bg-poke-fairy-300 from-poke-fairy-300 to-poke-fairy-300
// bg-poke-fighting-300 from-poke-fighting-300 to-poke-fighting-300
// bg-poke-psychic-300 from-poke-psychic-300 to-poke-psychic-300
// bg-poke-rock-300 from-poke-rock-300 to-poke-rock-300
// bg-poke-steel-300 from-poke-steel-300 to-poke-steel-300
// bg-poke-ice-300 from-poke-ice-300 to-poke-ice-300
// bg-poke-ghost-300 from-poke-ghost-300 to-poke-ghost-300
// bg-poke-dragon-300 from-poke-dragon-300 to-poke-dragon-300
// bg-poke-dark-300 from-poke-dark-300 to-poke-dark-300
// bg-poke-poison-300 from-poke-poison-300 to-poke-poison-300
// bg-poke-flying-300 from-poke-flying-300 to-poke-flying-300
