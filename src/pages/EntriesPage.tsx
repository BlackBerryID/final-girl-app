import {
  ActionIcon,
  Alert,
  Anchor,
  Box,
  Button,
  Group,
  Loader,
  Modal,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core'
import { Fragment, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { createDump, deleteEntry, fetchEntries } from '../api.ts'
import { DARK_POWERS_BY_KILLER, FINALES_BY_KILLER, isEpicOption } from '../data/gameOptions.ts'
import { featureFilmImage, heroImage, killerImage, locationImage } from '../data/portraits.ts'
import type { Entry } from '../types.ts'

const COLUMN_COUNT = 13

function displayDate(value: string | undefined) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? '')
  if (!match) return ''
  return `${match[3]}.${match[2]}.${match[1]}`
}

function displayText(value: string | undefined) {
  return value ?? ''
}

function MarkedValue({
  value,
  epic,
}: {
  value: string | undefined
  epic: boolean
}) {
  const text = displayText(value)
  if (!text) {
    return (
      <Text span aria-label="No">
        {'\u2796'}
      </Text>
    )
  }
  if (!epic) return text
  return <span className="epic-history">{text}</span>
}

function FlagMark({ value }: { value: boolean | null | undefined }) {
  if (typeof value !== 'boolean') return null

  return (
    <Text span aria-label={value ? 'Yes' : 'No'}>
      {value ? '\u2795' : '\u2796'}
    </Text>
  )
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 7h16" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M7 7l1 13h8l1-13" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  )
}

function NamedPortrait({
  name,
  image,
  imagePosition = 'center top',
}: {
  name: string | undefined
  image: string | undefined
  imagePosition?: string
}) {
  if (!name) return null

  return (
    <Group gap="xs" wrap="nowrap">
      {image ? (
        <span
          aria-hidden
          className="size-12 shrink-0 rounded-full bg-no-repeat"
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: '200% auto',
            backgroundPosition: imagePosition,
          }}
        />
      ) : null}
      <Text fw={500}>{name}</Text>
    </Group>
  )
}

function ResultText({ value }: { value: boolean | undefined }) {
  if (typeof value !== 'boolean') return null
  return (
    <Text fw={600} c={value ? 'teal' : 'red'}>
      {value ? 'Win' : 'Lose'}
    </Text>
  )
}

export default function EntriesPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [dumping, setDumping] = useState(false)
  const [dumpMessage, setDumpMessage] = useState<string | null>(null)
  const [dumpError, setDumpError] = useState<string | null>(null)

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

  async function handleDump() {
    setDumping(true)
    setDumpError(null)
    setDumpMessage(null)

    try {
      const fileName = await createDump()
      setDumpMessage(`Saved data/dumps/${fileName}`)
    } catch (reason: unknown) {
      setDumpError(reason instanceof Error ? reason.message : 'Could not create the dump')
    } finally {
      setDumping(false)
    }
  }

  function closeDelete() {
    if (deleting) return
    setDeleteId(null)
    setDeleteError(null)
  }

  async function confirmDelete() {
    if (!deleteId) return
    setDeleting(true)
    setDeleteError(null)

    try {
      await deleteEntry(deleteId)
      setEntries((current) => current.filter((entry) => entry.id !== deleteId))
      setDeleteId(null)
    } catch (reason: unknown) {
      setDeleteError(reason instanceof Error ? reason.message : 'Could not delete the entry')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Box className="history-layout" miw={0}>
          <Stack align="center" gap="md" w="100%" miw={0}>
            <Box pos="relative" w="100%">
              <Title order={1} ta="center">
                History
              </Title>
              <Button
                pos="absolute"
                top={0}
                right={0}
                variant="default"
                loading={dumping}
                onClick={() => void handleDump()}
              >
                Dump
              </Button>
            </Box>
            {dumpMessage ? (
              <Text size="sm" c="dimmed" ta="right" w="100%">
                {dumpMessage}
              </Text>
            ) : null}
            {dumpError ? (
              <Alert color="red" w="100%">
                {dumpError}
              </Alert>
            ) : null}
            {loading ? <Loader /> : null}
            {error ? (
              <Alert color="red" w="100%">
                {error}
              </Alert>
            ) : null}
            {!loading && !error && entries.length === 0 ? (
              <Text ta="center">
                No history yet. <Anchor component={Link} to="/entries/new">Add game</Anchor>.
              </Text>
            ) : null}
            {entries.length > 0 ? (
              <Table.ScrollContainer minWidth={1480} w="100%" miw={0} maw="100%" type="native">
                <Table
                  striped
                  withTableBorder
                  verticalSpacing="md"
                  horizontalSpacing="sm"
                  className="history-table"
                >
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Date</Table.Th>
                      <Table.Th>Feature film</Table.Th>
                      <Table.Th>Killer</Table.Th>
                      <Table.Th>Location</Table.Th>
                      <Table.Th>Hero</Table.Th>
                      <Table.Th>Dark power</Table.Th>
                      <Table.Th>Finale</Table.Th>
                      <Table.Th ta="center">Ultimate ability</Table.Th>
                      <Table.Th ta="center">Weapon used</Table.Th>
                      <Table.Th>Signature card</Table.Th>
                      <Table.Th>Note</Table.Th>
                      <Table.Th>Result</Table.Th>
                      <Table.Th>
                        <span className="sr-only">Delete</span>
                      </Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {entries.map((entry, index) => {
                      const previous = entries[index - 1]
                      const startsNewDay =
                        previous !== undefined && (previous.date ?? '') !== (entry.date ?? '')

                      return (
                        <Fragment key={entry.id}>
                          {startsNewDay ? (
                            <Table.Tr className="history-day-gap" aria-hidden>
                              <Table.Td colSpan={COLUMN_COUNT} />
                            </Table.Tr>
                          ) : null}
                          <Table.Tr>
                            <Table.Td>
                              <Text fw={500} style={{ whiteSpace: 'nowrap' }}>
                                {displayDate(entry.date)}
                              </Text>
                            </Table.Td>
                            <Table.Td>
                              <NamedPortrait
                                name={entry.featureFilm}
                                image={featureFilmImage(entry.featureFilm)}
                              />
                            </Table.Td>
                            <Table.Td>
                              <NamedPortrait name={entry.killer} image={killerImage(entry.killer)} />
                            </Table.Td>
                            <Table.Td>
                              <NamedPortrait
                                name={entry.location}
                                image={locationImage(entry.location)}
                              />
                            </Table.Td>
                            <Table.Td>
                              {entry.hero === null ? (
                                <Text span aria-label="No">
                                  {'\u2796'}
                                </Text>
                              ) : (
                                <NamedPortrait
                                  name={entry.hero}
                                  image={heroImage(entry.hero)}
                                  imagePosition="center center"
                                />
                              )}
                            </Table.Td>
                            <Table.Td>
                              <MarkedValue
                                value={entry.darkPower}
                                epic={isEpicOption(DARK_POWERS_BY_KILLER, entry.killer, entry.darkPower)}
                              />
                            </Table.Td>
                            <Table.Td>
                              <MarkedValue
                                value={entry.finale}
                                epic={isEpicOption(FINALES_BY_KILLER, entry.killer, entry.finale)}
                              />
                            </Table.Td>
                            <Table.Td ta="center">
                              <FlagMark value={entry.isHeroUltimateAbilityRevealed} />
                            </Table.Td>
                            <Table.Td ta="center">
                              <FlagMark value={entry.isHeroWeaponUsed} />
                            </Table.Td>
                            <Table.Td>{displayText(entry.signatureCard)}</Table.Td>
                            <Table.Td>{displayText(entry.note)}</Table.Td>
                            <Table.Td>
                              <ResultText value={entry.result} />
                            </Table.Td>
                            <Table.Td>
                              <ActionIcon
                                type="button"
                                variant="subtle"
                                color="red"
                                size="sm"
                                aria-label="Delete"
                                onClick={() => {
                                  setDeleteError(null)
                                  setDeleteId(entry.id)
                                }}
                              >
                                <TrashIcon />
                              </ActionIcon>
                            </Table.Td>
                          </Table.Tr>
                        </Fragment>
                      )
                    })}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            ) : null}
          </Stack>
      </Box>
      <Modal
        opened={deleteId !== null}
        onClose={closeDelete}
        title="Delete entry"
        centered
        closeOnClickOutside={!deleting}
        closeOnEscape={!deleting}
      >
        <Stack>
          <Text>Are you sure you want to delete this entry?</Text>
          {deleteError ? (
            <Text c="red" size="sm">
              {deleteError}
            </Text>
          ) : null}
          <Group justify="flex-end">
            <Button variant="default" onClick={closeDelete} disabled={deleting}>
              No
            </Button>
            <Button color="red" loading={deleting} onClick={() => void confirmDelete()}>
              Yes
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
