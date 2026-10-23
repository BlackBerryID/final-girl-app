import { Box, Button, Stack, Title } from '@mantine/core'
import { Link } from 'react-router'

export default function StatsPage() {
  return (
    <Box className="stats-layout">
      <Stack gap="md">
        <Title order={1} ta="center">
          Statistics
        </Title>
        <Button
          component={Link}
          to="/stats/killers"
          variant="default"
          size="lg"
          fullWidth
          justify="flex-start"
        >
          Killers win rate and number of games
        </Button>
      </Stack>
    </Box>
  )
}
