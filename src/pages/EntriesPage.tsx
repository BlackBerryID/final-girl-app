import { Alert, Anchor, Group, Loader, Stack, Table, Text, Title } from '@mantine/core'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { fetchEntries } from '../api.ts'
import { featureFilmImage, killerImage, locationImage } from '../data/portraits.ts'
import type { Entry } from '../types.ts'

function formatCreatedAt(value: string) {
  return new Date(value).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function NamedPortrait({ name, image }: { name: string | undefined; image: string | undefined }) {
  if (!name) return <Text span>—</Text>

  return (
    <Group gap="xs" wrap="nowrap">
      {image ? (
        <span
          aria-hidden
          className="size-[calc(4rem/1.5)] shrink-0 rounded-full bg-no-repeat"
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: '200% auto',
            backgroundPosition: 'center top',
          }}
        />
      ) : null}
      <Text fw={500}>{name}</Text>
    </Group>
  )
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
    <Stack align="center" gap="md" w="100%">
      <Title order={1} ta="center">
        Entries
      </Title>
      {loading ? <Loader /> : null}
      {error ? (
        <Alert color="red" w="100%">
          {error}
        </Alert>
      ) : null}
      {!loading && !error && entries.length === 0 ? (
        <Text ta="center">
          No entries yet. <Anchor component={Link} to="/entries/new">Add the first one</Anchor>.
        </Text>
      ) : null}
      {entries.length > 0 ? (
        <Table.ScrollContainer minWidth={720} w="100%">
          <Table striped withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Feature film</Table.Th>
                <Table.Th>Killer</Table.Th>
                <Table.Th>Location</Table.Th>
                <Table.Th>Added</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {entries.map((entry) => (
                <Table.Tr key={entry.id}>
                  <Table.Td>
                    <NamedPortrait name={entry.featureFilm} image={featureFilmImage(entry.featureFilm)} />
                  </Table.Td>
                  <Table.Td>
                    <NamedPortrait name={entry.killer} image={killerImage(entry.killer)} />
                  </Table.Td>
                  <Table.Td>
                    <NamedPortrait name={entry.location} image={locationImage(entry.location)} />
                  </Table.Td>
                  <Table.Td>
                    <Text c="dimmed">{formatCreatedAt(entry.createdAt)}</Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      ) : null}
    </Stack>
  )
}
