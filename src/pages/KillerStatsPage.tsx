import {
  Alert,
  Box,
  Checkbox,
  Group,
  Loader,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { useEffect, useMemo, useState } from 'react'
import { fetchEntries } from '../api.ts'
import { killerImage } from '../data/portraits.ts'
import { killerStats, type KillerStat } from '../stats.ts'
import type { Entry } from '../types.ts'

type ChartMetric = 'winRate' | 'games'
type SortOrder = 'asc' | 'desc'

function formatWinRate(value: number) {
  return `${Math.round(value)}%`
}

function columnLabel(row: KillerStat, metric: ChartMetric) {
  return metric === 'winRate' ? formatWinRate(row.winRate) : String(row.games)
}

function columnHeight(row: KillerStat, metric: ChartMetric, maxGames: number) {
  if (metric === 'winRate') return row.winRate
  if (maxGames <= 0) return 0
  return (row.games / maxGames) * 100
}

function columnSummary(row: KillerStat) {
  const games = row.games === 1 ? '1 game' : `${row.games} games`
  const wins = row.wins === 1 ? '1 win' : `${row.wins} wins`
  return `${row.killer}: ${formatWinRate(row.winRate)}, ${wins} in ${games}`
}

function KillerColumn({
  row,
  metric,
  maxGames,
}: {
  row: KillerStat
  metric: ChartMetric
  maxGames: number
}) {
  const height = Math.min(100, Math.max(0, columnHeight(row, metric, maxGames)))
  const image = killerImage(row.killer)

  return (
    <Stack
      gap={8}
      h="100%"
      role="img"
      aria-label={columnSummary(row)}
      title={columnSummary(row)}
      style={{ flex: '1 0 5.5rem' }}
    >
      <Box pos="relative" w="100%" style={{ flex: 1, minHeight: 0 }} pt={28}>
        <Box pos="relative" h="100%">
          <Box
            pos="absolute"
            inset={0}
            style={{
              borderRadius: 6,
              background: 'var(--mantine-color-dark-6)',
              boxShadow: 'inset 0 0 0 1px var(--mantine-color-dark-4)',
            }}
          />
          <Box
            pos="absolute"
            left={0}
            right={0}
            bottom={0}
            style={{ height: `${height}%`, overflow: 'hidden', borderRadius: 6 }}
          >
            <Box
              w="100%"
              style={{
                height: height > 0 ? `${10000 / height}%` : 0,
                backgroundImage: image ? `url(${image})` : undefined,
                backgroundColor: 'var(--mantine-color-gray-6)',
                backgroundPosition: 'center top',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
              }}
            />
          </Box>
          <Text
            size="xs"
            fw={700}
            ta="center"
            style={{
              position: 'absolute',
              zIndex: 1,
              left: 0,
              right: 0,
              bottom: `calc(${height}% + 4px)`,
            }}
          >
            {columnLabel(row, metric)}
          </Text>
        </Box>
      </Box>
      <Text size="xs" ta="center" h={72} lh={1.25}>
        {row.killer}
      </Text>
    </Stack>
  )
}

export default function KillerStatsPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [metric, setMetric] = useState<ChartMetric>('winRate')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [includeAllLocations, setIncludeAllLocations] = useState(false)

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

  const rows = useMemo(() => {
    const direction = sortOrder === 'asc' ? 1 : -1
    return killerStats(entries, includeAllLocations).sort((left, right) => {
      const byMetric = metric === 'winRate' ? left.winRate - right.winRate : left.games - right.games
      if (byMetric !== 0) return byMetric * direction
      return left.killer.localeCompare(right.killer)
    })
  }, [entries, includeAllLocations, metric, sortOrder])

  const maxGames = rows.reduce((max, row) => Math.max(max, row.games), 0)

  return (
    <Box className="stats-layout">
      <Stack gap="md">
        <Title order={1} ta="center">
          Killers win rate and number of games
        </Title>
        {loading ? <Loader mx="auto" /> : null}
        {error ? (
          <Alert color="red" w="100%">
            {error}
          </Alert>
        ) : null}
        {!loading && !error ? (
          <Paper withBorder p="md" radius="md">
            <Stack gap="lg">
              <Group justify="space-between" align="flex-end" gap="md">
                <Stack gap={6}>
                  <Text size="sm" fw={500}>
                    Data
                  </Text>
                  <SegmentedControl
                    value={metric}
                    onChange={(value) => {
                      if (value === 'winRate' || value === 'games') setMetric(value)
                    }}
                    data={[
                      { label: 'Win %', value: 'winRate' },
                      { label: 'Games', value: 'games' },
                    ]}
                  />
                </Stack>
                <Stack gap={6}>
                  <Text size="sm" fw={500}>
                    Sort
                  </Text>
                  <SegmentedControl
                    value={sortOrder}
                    onChange={(value) => {
                      if (value === 'asc' || value === 'desc') setSortOrder(value)
                    }}
                    data={[
                      { label: 'Descending', value: 'desc' },
                      { label: 'Ascending', value: 'asc' },
                    ]}
                  />
                </Stack>
              </Group>
              <Checkbox
                checked={includeAllLocations}
                onChange={(event) => setIncludeAllLocations(event.currentTarget.checked)}
                label="All locations"
                description="Count games on every location, including ones outside the feature film."
              />
              {rows.length === 0 ? (
                <Text ta="center" c="dimmed">
                  {includeAllLocations
                    ? 'No games to show yet.'
                    : 'No feature-film games to show yet.'}
                </Text>
              ) : (
                <Box w="100%" style={{ overflowX: 'auto' }}>
                  <Group
                    align="stretch"
                    gap="sm"
                    wrap="nowrap"
                    h={420}
                    style={{ minWidth: rows.length * 88 }}
                  >
                    {rows.map((row) => (
                      <KillerColumn key={row.killer} row={row} metric={metric} maxGames={maxGames} />
                    ))}
                  </Group>
                </Box>
              )}
            </Stack>
          </Paper>
        ) : null}
      </Stack>
    </Box>
  )
}
