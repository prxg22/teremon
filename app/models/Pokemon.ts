// export type TypeRelation = {
//   id: number
//   name: string
//   relation: string
// }

export type Type = {
  id: number
  name: string
  // relations?: TypeRelation[]
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
