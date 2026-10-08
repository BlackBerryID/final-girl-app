import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { createEntry } from '../api.ts'

export default function NewEntryPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      await createEntry({ title: title.trim(), note: note.trim() })
      await navigate('/')
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Не удалось сохранить запись')
      setSaving(false)
    }
  }

  return (
    <section>
      <h1>Новая запись</h1>
      <form className="entry-form" onSubmit={(event) => void handleSubmit(event)}>
        <label>
          Название
          <input
            name="title"
            value={title}
            maxLength={200}
            required
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        <label>
          Заметка
          <textarea
            name="note"
            value={note}
            maxLength={2000}
            rows={5}
            onChange={(event) => setNote(event.target.value)}
          />
        </label>
        {error ? <p className="error">{error}</p> : null}
        <button type="submit" disabled={saving || title.trim().length === 0}>
          {saving ? 'Сохранение…' : 'Сохранить'}
        </button>
      </form>
    </section>
  )
}
