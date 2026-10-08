import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { fetchEntries } from '../api.ts'
import type { Entry } from '../types.ts'

function formatCreatedAt(value: string) {
  return new Date(value).toLocaleString('ru-RU', {
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
        setError(reason instanceof Error ? reason.message : 'Не удалось загрузить записи')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [])

  return (
    <section>
      <h1>Записи</h1>
      {loading ? <p className="muted">Загрузка…</p> : null}
      {error ? <p className="error">{error}</p> : null}
      {!loading && !error && entries.length === 0 ? (
        <p className="muted">
          Записей пока нет. <Link to="/entries/new">Добавить первую</Link>.
        </p>
      ) : null}
      {entries.length > 0 ? (
        <ul className="entries">
          {entries.map((entry) => (
            <li key={entry.id}>
              <h2>{entry.title}</h2>
              <p className="muted">{formatCreatedAt(entry.createdAt)}</p>
              {entry.note ? <p>{entry.note}</p> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
