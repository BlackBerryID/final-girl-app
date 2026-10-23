import { Button, Checkbox, Group, Input, Paper, Select, SimpleGrid, Stack, Switch, Text, TextInput, Title } from '@mantine/core'
import { DateInput } from '@mantine/dates'
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
import {
  DARK_POWERS_BY_KILLER,
  FINALES_BY_KILLER,
  SIGNATURE_CARDS,
  markedOptionsForKiller,
  type MarkedOption,
} from '../data/gameOptions.ts'
import { HEROES } from '../data/heroes.ts'

const DATE_FORMAT = 'DD.MM.YYYY'

type EntryFormValues = {
  date: string | null
  killer: string | null
  location: string | null
  featureFilm: string | null
  hero: string | null
  heroNoData: boolean
  darkPower: string | null
  finale: string | null
  isHeroUltimateAbilityRevealed: boolean
  ultimateAbilityNoData: boolean
  isHeroWeaponUsed: boolean
  weaponUsedNoData: boolean
  signatureCard: string | null
  note: string
  result: boolean
}

function selectItems(options: readonly MarkedOption[]) {
  return options.map((option) => ({
    value: option.name,
    label: option.name,
    epic: option.epic === true,
  }))
}

function renderEpicOption({ option }: { option: { label: string; epic?: boolean } }) {
  if (!option.epic) return option.label
  return <span className="epic-option">{option.label}</span>
}

function parseDateInput(value: string): string | null {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value.trim())
  if (!match) return null
  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }
  const isoMonth = String(month).padStart(2, '0')
  const isoDay = String(day).padStart(2, '0')
  return `${year}-${isoMonth}-${isoDay}`
}

export default function NewEntryPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const form = useForm<EntryFormValues>({
    mode: 'controlled',
    initialValues: {
      date: null,
      killer: null,
      location: null,
      featureFilm: null,
      hero: null,
      heroNoData: false,
      darkPower: null,
      finale: null,
      isHeroUltimateAbilityRevealed: false,
      ultimateAbilityNoData: false,
      isHeroWeaponUsed: false,
      weaponUsedNoData: false,
      signatureCard: null,
      note: '',
      result: false,
    },
    validate: {
      date: (value) => (value ? null : 'Choose a date'),
      killer: (value) => (value ? null : 'Choose a killer'),
      location: (value) => (value ? null : 'Choose a location'),
      hero: (value, values) => (values.heroNoData || value ? null : 'Choose a hero'),
      note: (value) => (value.length <= 10 ? null : 'Use at most 10 characters'),
    },
  })

  const killerSelected = Boolean(form.values.killer)
  const darkPowerOptions = selectItems(markedOptionsForKiller(DARK_POWERS_BY_KILLER, form.values.killer))
  const finaleOptions = selectItems(markedOptionsForKiller(FINALES_BY_KILLER, form.values.killer))
  const canSave = Boolean(
    form.values.date &&
      form.values.killer &&
      form.values.location &&
      (form.values.heroNoData || form.values.hero),
  )

  function clearKillerDependents() {
    form.setFieldValue('darkPower', null)
    form.setFieldValue('finale', null)
  }

  function handleFeatureFilmChange(nextFilm: string | null) {
    form.setFieldValue('featureFilm', nextFilm)
    if (!nextFilm) return
    const film = findFeatureFilm(nextFilm)
    if (!film) return
    if (film.killer !== (form.values.killer ?? '')) clearKillerDependents()
    form.setFieldValue('killer', film.killer)
    form.setFieldValue('location', film.location)
  }

  function handleKillerChange(nextKiller: string | null) {
    const killerName = nextKiller ?? ''
    if (killerName !== (form.values.killer ?? '')) clearKillerDependents()
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
        date: values.date ?? '',
        killer: values.killer ?? '',
        location: values.location ?? '',
        featureFilm: values.featureFilm ?? '',
        hero: values.heroNoData ? null : (values.hero ?? ''),
        darkPower: values.darkPower ?? '',
        finale: values.finale ?? '',
        isHeroUltimateAbilityRevealed: values.ultimateAbilityNoData ? null : values.isHeroUltimateAbilityRevealed,
        isHeroWeaponUsed: values.weaponUsedNoData ? null : values.isHeroWeaponUsed,
        signatureCard: values.signatureCard ?? '',
        note: values.note,
        result: values.result,
      })
      await navigate('/')
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Could not save the entry')
      setSaving(false)
    }
  }

  return (
    <Stack align="center" gap="md" w="100%" maw="75em" mx="auto">
      <Title order={1} ta="center">
        Add game
      </Title>
      <Paper withBorder p="md" radius="md" w="100%">
        <form onSubmit={form.onSubmit((values) => void handleSubmit(values))}>
          <Stack>
            <DateInput
              label="Date"
              placeholder={DATE_FORMAT}
              valueFormat={DATE_FORMAT}
              dateParser={parseDateInput}
              required
              withAsterisk
              clearable
              key={form.key('date')}
              {...form.getInputProps('date')}
            />
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
            <Group align="flex-end" wrap="nowrap" gap="md">
              <Select
                label="Hero"
                placeholder="Start typing"
                data={[...HEROES]}
                required={!form.values.heroNoData}
                withAsterisk={!form.values.heroNoData}
                searchable
                nothingFoundMessage="Nothing found"
                style={{ flex: '1 1 auto' }}
                key={form.key('hero')}
                {...form.getInputProps('hero')}
                disabled={form.values.heroNoData}
              />
              <Checkbox
                label="No data"
                mb={8}
                key={form.key('heroNoData')}
                {...form.getInputProps('heroNoData', { type: 'checkbox' })}
              />
            </Group>
            <SimpleGrid cols={2}>
              <Select
                label="Dark power"
                placeholder={killerSelected ? 'Start typing' : 'Choose a killer first'}
                data={darkPowerOptions}
                renderOption={renderEpicOption}
                disabled={!killerSelected}
                searchable
                clearable
                nothingFoundMessage="Nothing found"
                key={form.key('darkPower')}
                {...form.getInputProps('darkPower')}
              />
              <Select
                label="Finale"
                placeholder={killerSelected ? 'Start typing' : 'Choose a killer first'}
                data={finaleOptions}
                renderOption={renderEpicOption}
                disabled={!killerSelected}
                searchable
                clearable
                nothingFoundMessage="Nothing found"
                key={form.key('finale')}
                {...form.getInputProps('finale')}
              />
            </SimpleGrid>
            <Group gap="lg" align="center">
              <Switch
                label="Ultimate ability revealed"
                key={form.key('isHeroUltimateAbilityRevealed')}
                {...form.getInputProps('isHeroUltimateAbilityRevealed', { type: 'checkbox' })}
                disabled={form.values.ultimateAbilityNoData}
              />
              <Checkbox
                label="No data"
                key={form.key('ultimateAbilityNoData')}
                {...form.getInputProps('ultimateAbilityNoData', { type: 'checkbox' })}
              />
            </Group>
            <Group gap="lg" align="center">
              <Switch
                label="Hero weapon used"
                key={form.key('isHeroWeaponUsed')}
                {...form.getInputProps('isHeroWeaponUsed', { type: 'checkbox' })}
                disabled={form.values.weaponUsedNoData}
              />
              <Checkbox
                label="No data"
                key={form.key('weaponUsedNoData')}
                {...form.getInputProps('weaponUsedNoData', { type: 'checkbox' })}
              />
            </Group>
            <Select
              label="Signature card"
              placeholder="Start typing"
              data={[...SIGNATURE_CARDS]}
              searchable
              clearable
              nothingFoundMessage="Nothing found"
              key={form.key('signatureCard')}
              {...form.getInputProps('signatureCard')}
            />
            <TextInput
              label="Note"
              maxLength={10}
              key={form.key('note')}
              {...form.getInputProps('note')}
            />
            <Input.Wrapper label="Result">
              <Group gap="sm" wrap="nowrap" mt={4}>
                <Text size="sm" fw={form.values.result ? 400 : 700} c={form.values.result ? 'dimmed' : undefined}>
                  Lose
                </Text>
                <Switch
                  aria-label="Result"
                  key={form.key('result')}
                  {...form.getInputProps('result', { type: 'checkbox' })}
                />
                <Text size="sm" fw={form.values.result ? 700 : 400} c={form.values.result ? undefined : 'dimmed'}>
                  Win
                </Text>
              </Group>
            </Input.Wrapper>
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
