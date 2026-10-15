import { Button, Group, Paper, Select, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { createEntry } from '../api.ts'
import {
  FEATURE_FILM_OPTIONS,
  KILLERS,
  LOCATIONS,
  findFeatureFilm,
  findFeatureFilmByPair,
} from '../data/featureFilms.ts'

type EntryFormValues = {
  killer: string | null
  location: string | null
  featureFilm: string | null
}

export default function NewEntryPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const form = useForm<EntryFormValues>({
    mode: 'controlled',
    initialValues: {
      killer: null,
      location: null,
      featureFilm: null,
    },
    validate: {
      killer: (value) => (value ? null : 'Choose a killer'),
      location: (value) => (value ? null : 'Choose a location'),
    },
  })

  const canSave = Boolean(form.values.killer && form.values.location)

  function handleFeatureFilmChange(nextFilm: string | null) {
    form.setFieldValue('featureFilm', nextFilm)
    if (!nextFilm) return
    const film = findFeatureFilm(nextFilm)
    if (!film) return
    form.setFieldValue('killer', film.killer)
    form.setFieldValue('location', film.location)
  }

  function handleKillerChange(nextKiller: string | null) {
    const killerName = nextKiller ?? ''
    form.setFieldValue('killer', nextKiller)
    form.setFieldValue(
      'featureFilm',
      findFeatureFilmByPair(killerName, form.values.location ?? '')?.name ?? null,
    )
  }

  function handleLocationChange(nextLocation: string | null) {
    const locationName = nextLocation ?? ''
    form.setFieldValue('location', nextLocation)
    form.setFieldValue(
      'featureFilm',
      findFeatureFilmByPair(form.values.killer ?? '', locationName)?.name ?? null,
    )
  }

  async function handleSubmit(values: EntryFormValues) {
    setSaving(true)
    setError(null)

    try {
      await createEntry({
        killer: values.killer ?? '',
        location: values.location ?? '',
        featureFilm: values.featureFilm ?? '',
      })
      await navigate('/')
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Could not save the entry')
      setSaving(false)
    }
  }

  return (
    <Stack align="center" gap="md" w="100%">
      <Title order={1} ta="center">
        New entry
      </Title>
      <Paper withBorder p="md" radius="md" w="100%">
        <form onSubmit={form.onSubmit((values) => void handleSubmit(values))}>
          <Stack>
            <Select
              label="Feature film"
              placeholder="Start typing"
              data={FEATURE_FILM_OPTIONS}
              searchable
              nothingFoundMessage="Nothing found"
              key={form.key('featureFilm')}
              {...form.getInputProps('featureFilm')}
              onChange={handleFeatureFilmChange}
            />
            <SimpleGrid cols={2}>
              <Select
                label="Killer"
                placeholder="Start typing"
                data={KILLERS}
                required
                withAsterisk
                searchable
                nothingFoundMessage="Nothing found"
                key={form.key('killer')}
                {...form.getInputProps('killer')}
                onChange={handleKillerChange}
              />
              <Select
                label="Location"
                placeholder="Start typing"
                data={LOCATIONS}
                required
                withAsterisk
                searchable
                nothingFoundMessage="Nothing found"
                key={form.key('location')}
                {...form.getInputProps('location')}
                onChange={handleLocationChange}
              />
            </SimpleGrid>
            {error ? (
              <Text c="red" ta="center">
                {error}
              </Text>
            ) : null}
            <Group justify="center">
              <Button type="submit" loading={saving} disabled={!canSave}>
                Add
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Stack>
  )
}
