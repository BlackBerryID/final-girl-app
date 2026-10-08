export type Entry = {
  id: string
  title: string
  note: string
  createdAt: string
}

export type DatabaseData = {
  entries: Entry[]
}
