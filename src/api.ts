import type { Entry } from './types.ts'

export type NewEntry = {
  title: string
  note: string
}

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: unknown }
    if (typeof body.error === 'string' && body.error.length > 0) return body.error
  } catch {
    // The response body is not JSON.
  }

  return 'Не удалось сохранить запись'
}

export async function fetchEntries(signal?: AbortSignal): Promise<Entry[]> {
  const response = await fetch('/api/entries', { signal })
  if (!response.ok) throw new Error('Не удалось загрузить записи')
  return response.json() as Promise<Entry[]>
}

export async function createEntry(input: NewEntry): Promise<Entry> {
  const response = await fetch('/api/entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  if (!response.ok) throw new Error(await readError(response))
  return response.json() as Promise<Entry>
}
