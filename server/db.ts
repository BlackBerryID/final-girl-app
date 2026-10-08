import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { JSONFilePreset } from 'lowdb/node'
import type { DatabaseData, Entry } from '../src/types.ts'

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
  return [...database.data.entries].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  )
}

export async function addEntry(input: {
  title: string
  note: string
}): Promise<Entry> {
  const entry: Entry = {
    id: crypto.randomUUID(),
    title: input.title,
    note: input.note,
    createdAt: new Date().toISOString(),
  }

  await change((data) => {
    data.entries.push(entry)
  })

  return entry
}
