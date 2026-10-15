import { Select } from '@mantine/core'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { createEntry } from '../api.ts'
import {
  FEATURE_FILM_OPTIONS,
  KILLERS,
  LOCATIONS,
  findFeatureFilm,
  findFeatureFilmByPair,
} from '../data/featureFilms.ts'

export default function NewEntryPage() {
  const navigate = useNavigate()
  const [killer, setKiller] = useState('')
  const [location, setLocation] = useState('')
  const [featureFilm, setFeatureFilm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const canSave = killer.length > 0 && location.length > 0 && featureFilm.length > 0

  function handleFeatureFilmChange(nextFilm: string) {
    setFeatureFilm(nextFilm)
    const film = findFeatureFilm(nextFilm)
    if (!film) return
    setKiller(film.killer)
    setLocation(film.location)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      await createEntry({ killer, location, featureFilm })
      await navigate('/')
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Could not save the entry')
      setSaving(false)
    }
  }

  return (
    <section className="flex w-full flex-col items-center gap-4">
      <h1 className="text-center text-3xl font-semibold">New entry</h1>
      <form
        className="grid w-full grid-cols-12 gap-4 rounded-xl border border-zinc-600 bg-zinc-800 p-4"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <div className="col-span-12">
          <Select
            label="Feature film"
            placeholder="Start typing"
            data={[...FEATURE_FILM_OPTIONS]}
            value={featureFilm || null}
            onChange={(nextFilm) => handleFeatureFilmChange(nextFilm ?? '')}
            searchable
            nothingFoundMessage="Nothing found"
          />
        </div>
        <div className="col-span-6">
          <Select
            label="Killer"
            placeholder="Start typing"
            data={KILLERS}
            value={killer || null}
            onChange={(nextKiller) => {
              const killerName = nextKiller ?? ''
              setKiller(killerName)
              setFeatureFilm(findFeatureFilmByPair(killerName, location)?.name ?? '')
            }}
            searchable
            nothingFoundMessage="Nothing found"
          />
        </div>
        <div className="col-span-6">
          <Select
            label="Location"
            placeholder="Start typing"
            data={LOCATIONS}
            value={location || null}
            onChange={(nextLocation) => {
              const locationName = nextLocation ?? ''
              setLocation(locationName)
              setFeatureFilm(findFeatureFilmByPair(killer, locationName)?.name ?? '')
            }}
            searchable
            nothingFoundMessage="Nothing found"
          />
        </div>
        {error ? <p className="col-span-12 text-center text-rose-300">{error}</p> : null}
        <button
          type="submit"
          disabled={saving || !canSave}
          className="col-span-12 justify-self-center rounded-lg bg-zinc-100 px-4 py-2 font-semibold text-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Add
        </button>
      </form>
    </section>
  )
}
