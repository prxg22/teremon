import { Type } from "./Type"

export type Pokemon = {
  id: number
  name: string
  like: boolean
  types: Type[]
}
