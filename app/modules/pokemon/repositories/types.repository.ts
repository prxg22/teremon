import { db } from "~/db"
import { Type } from "~/types/Type"

export const getTypeByName = (name: string) =>
  db.prepare<string, Type>("SELECT * FROM types WHERE name = ?").get(name)

export const createType = (name: string): Type => {
  const response = db.prepare("INSERT INTO types (name) VALUES (?)").run(name)

  if (response.changes < 1) throw Error("Type was not inserted")

  return {
    id: Number(response.lastInsertRowid),
    name,
  }
}
