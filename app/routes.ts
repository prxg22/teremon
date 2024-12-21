import { index, layout, route } from '@remix-run/route-config'

export default [
  index('./routes/_index.tsx'),
  layout('./routes/_main.tsx', [
    route('/pokemon', './routes/_main.pokemon.tsx'),
    route('/pokemon/:pokemonId', './routes/_main.pokemon_.$pokemonId.tsx'),
    route('/pokemon/liked', './routes/_main.pokemon_.liked.tsx'),
  ]),
]
