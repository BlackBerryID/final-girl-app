import { Anchor, Box, Group, Stack, Title } from '@mantine/core'
import { NavLink, Route, Routes } from 'react-router'
import EntriesPage from './pages/EntriesPage.tsx'
import KillerStatsPage from './pages/KillerStatsPage.tsx'
import NewEntryPage from './pages/NewEntryPage.tsx'
import StatsPage from './pages/StatsPage.tsx'

function AppLink({ to, end, children }: { to: string; end?: boolean; children: string }) {
  return (
    <Anchor
      component={NavLink}
      to={to}
      end={end}
      underline="hover"
      className="aria-[current=page]:underline"
    >
      {children}
    </Anchor>
  )
}

export default function App() {
  return (
    <Box mih="100svh" py="xl" px="md" w="100%" maw="100%" miw={0}>
      <Stack align="center" gap="xl" w="100%" maw="100%" miw={0}>
        <Stack align="center" gap="sm">
          <Title order={2}>Final Girl</Title>
          <Group justify="center" gap="lg">
            <AppLink to="/" end>
              History
            </AppLink>
            <AppLink to="/stats">Statistics</AppLink>
            <AppLink to="/entries/new">Add game</AppLink>
          </Group>
        </Stack>
        <Box component="main" w="100%" miw={0}>
            <Routes>
              <Route path="/" element={<EntriesPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/stats/killers" element={<KillerStatsPage />} />
              <Route path="/entries/new" element={<NewEntryPage />} />
              <Route path="*" element={<Title order={3} ta="center">Page not found.</Title>} />
            </Routes>
        </Box>
      </Stack>
    </Box>
  )
}
