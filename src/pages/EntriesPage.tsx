import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { fetchEntries } from '../api.ts'
import type { Entry } from '../types.ts'

function formatCreatedAt(value: string) {
  return new Date(value).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default function EntriesPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    fetchEntries(controller.signal)
      .then((nextEntries) => {
        if (!controller.signal.aborted) setEntries(nextEntries)
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return
        setError(reason instanceof Error ? reason.message : 'Could not load entries')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [])

  return (
    <section className="flex w-full flex-col items-center gap-4">
      <h1 className="text-center text-3xl font-semibold">Entries</h1>
      {loading ? <p className="text-zinc-300">Loading…</p> : null}
      {error ? <p className="text-rose-300">{error}</p> : null}
      {!loading && !error && entries.length === 0 ? (
        <p className="text-center text-zinc-300">
          No entries yet. <Link to="/entries/new" className="text-white underline">Add the first one</Link>.
        </p>
      ) : null}
      {entries.length > 0 ? (
        <table className="w-full border-separate border-spacing-0 overflow-hidden rounded-xl border border-zinc-600 text-left">
          <thead className="bg-zinc-800 text-sm text-zinc-300">
            <tr>
              <th className="px-4 py-3 font-semibold">Feature film</th>
              <th className="px-4 py-3 font-semibold">Killer</th>
              <th className="px-4 py-3 font-semibold">Location</th>
              <th className="px-4 py-3 font-semibold">Added</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-t border-zinc-600 bg-zinc-800/60">
                <td className="px-4 py-3">{entry.featureFilm ?? '—'}</td>
                <td className="px-4 py-3">{entry.killer ?? '—'}</td>
                <td className="px-4 py-3">{entry.location ?? '—'}</td>
                <td className="px-4 py-3 text-zinc-300">{formatCreatedAt(entry.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </section>
  )
}
