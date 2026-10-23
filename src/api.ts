import type { Entry, NewEntry } from './types.ts'

async function readError(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as { error?: unknown }
    if (typeof body.error === 'string' && body.error.length > 0) return body.error
  } catch {
    // The response body is not JSON.
  }

  return fallback
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

  if (!response.ok) throw new Error(await readError(response, 'Could not save the entry'))
  return response.json() as Promise<Entry>
}

export async function createDump(): Promise<string> {
  const response = await fetch('/api/dumps', { method: 'POST' })
  if (!response.ok) throw new Error(await readError(response, 'Could not create the dump'))

  const body = (await response.json()) as { fileName?: unknown }
  if (typeof body.fileName !== 'string' || body.fileName.length === 0) {
    throw new Error('Could not create the dump')
  }
  return body.fileName
}

export async function deleteEntry(id: string): Promise<void> {
  const response = await fetch(`/api/entries/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })

  if (!response.ok) throw new Error(await readError(response, 'Could not delete the entry'))
}
