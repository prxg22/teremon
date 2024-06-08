import type { Type } from '~/models/Pokemon'

export const derivateColorFromTypes = (types: Type[]) => {
  const secondary = types.length - 1
  return `from-poke-${types[0].name}-300 to-poke-${types[secondary].name}-300`
}

export const lpad = (n: number, width: number, z = '0') => {
  const nStr = n + ''
  return nStr.length >= width
    ? nStr
    : new Array(width - nStr.length + 1).join(z) + nStr
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
