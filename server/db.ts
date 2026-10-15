import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { JSONFilePreset } from 'lowdb/node'
import type { DatabaseData, Entry, NewEntry } from '../src/types.ts'

const databaseFile = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../data/db.json',
)

const defaultData: DatabaseData = { entries: [] }

let databasePromise: ReturnType<typeof JSONFilePreset<DatabaseData>> | undefined
let writeQueue: Promise<void> = Promise.resolve()

function getDatabase() {
  databasePromise ??= JSONFilePreset<DatabaseData>(databaseFile, defaultData)
  return databasePromise
}

function change(mutate: (data: DatabaseData) => void): Promise<void> {
  const run = writeQueue.then(async () => {
    const database = await getDatabase()
    await database.update(mutate)
  })

  writeQueue = run.then(
    () => undefined,
    () => undefined,
  )

  return run
}

export async function listEntries(): Promise<Entry[]> {
  await writeQueue
  const database = await getDatabase()
  return database.data.entries
    .map((entry, index) => ({ entry, index }))
    .sort((left, right) => {
      const byDate = (right.entry.date ?? '').localeCompare(left.entry.date ?? '')
      if (byDate !== 0) return byDate
      return right.index - left.index
    })
    .map(({ entry }) => entry)
}

export async function addEntry(input: NewEntry): Promise<Entry> {
  const entry: Entry = {
    id: crypto.randomUUID(),
    ...input,
  }

  await change((data) => {
    data.entries.push(entry)
  })

  return entry
}

export async function removeEntry(id: string): Promise<boolean> {
  let removed = false

  await change((data) => {
    const index = data.entries.findIndex((entry) => entry.id === id)
    if (index === -1) return
    data.entries.splice(index, 1)
    removed = true
  })

  return removed
}
