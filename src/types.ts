export type Entry = {
  id: string
  createdAt: string
  killer?: string
  location?: string
  featureFilm?: string
  title?: string
  note?: string
}

export type DatabaseData = {
  entries: Entry[]
}
