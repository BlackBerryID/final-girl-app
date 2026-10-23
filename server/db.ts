import { copyFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { JSONFilePreset } from 'lowdb/node'
import type { DatabaseData, Entry, NewEntry } from '../src/types.ts'

const dataDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../data')
const databaseFile = path.join(dataDirectory, 'db.json')
const dumpsDirectory = path.join(dataDirectory, 'dumps')

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

function dumpStamp(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0')
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  const time = `${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`
  return `${day}_${time}`
}

export async function dumpDatabase(): Promise<string> {
  await writeQueue
  await mkdir(dumpsDirectory, { recursive: true })
  const fileName = `dump_db_${dumpStamp(new Date())}.json`
  await copyFile(databaseFile, path.join(dumpsDirectory, fileName))
  return fileName
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
