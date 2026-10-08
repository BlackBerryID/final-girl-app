import type { Entry } from './types.ts'

export type NewEntry = {
  killer: string
  location: string
  featureFilm: string
}

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: unknown }
    if (typeof body.error === 'string' && body.error.length > 0) return body.error
  } catch {
    // The response body is not JSON.
  }

  return 'Could not save the entry'
}

export async function fetchEntries(signal?: AbortSignal): Promise<Entry[]> {
  const response = await fetch('/api/entries', { signal })
  if (!response.ok) throw new Error('Could not load entries')
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
