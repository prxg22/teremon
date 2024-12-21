export type Type = {
  id: number
  name: string
}

export type TypeInfo = {
  id: number
  name: string
}

export type Pokemon = {
  id: number
  name: string
  like: boolean
  types: TypeInfo[]
}
