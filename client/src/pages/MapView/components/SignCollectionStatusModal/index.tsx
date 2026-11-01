import {
  Box,
  EmptyStateScreen,
  Flex,
  ModalHeader,
  Stack,
  Text
} from '@lifeforge/ui'

import type { MapLine, MapStation } from '@/providers/RailwayMapProvider'

import CoverageMap from './components/CoverageMap'
import LineStatusCard from './components/LineStatusCard'
import { useSignCollectionStatus } from './hooks/useSignCollectionStatus'

function SignCollectionStatusModal({
  onClose,
  data: { stations: allStations, lines, lineCompletedAt }
}: {
  onClose: () => void
  data: {
    stations: MapStation[]
    lines: MapLine[]
    lineCompletedAt: Record<string, string>
  }
}) {
  const {
    collectedCodes,
    lineStatuses,
    totalCodes,
    collectedTotal,
    overallPercentage
  } = useSignCollectionStatus(allStations, lines, lineCompletedAt)

  if (lineStatuses.length === 0 || totalCodes === 0) {
    return (
      <Stack minWidth="40vw">
        <ModalHeader
          icon="tabler:sign-right"
          title="Sign Collection Status"
          onClose={onClose}
        />
        <Box py="2xl">
          <EmptyStateScreen
            icon="tabler:map-pin-off"
            message={{
              id: 'sign'
            }}
          />
        </Box>
      </Stack>
    )
  }

  return (
    <Stack maxHeight="80vh" minWidth="30vw">
      <ModalHeader
        icon="tabler:sign-right"
        title="Sign Collection Status"
        onClose={onClose}
      />
      <CoverageMap
        collectedCodes={collectedCodes}
        lines={lines}
        stations={allStations}
      />
      <Flex align="center" gap="md" justify="between" py="md">
        <Text color="muted">
          {collectedTotal} / {totalCodes} codes
        </Text>
        <Text color="primary" size="xl" weight="bold">
          {overallPercentage}%
        </Text>
      </Flex>
      <Stack pb="lg">
        {lineStatuses.map(line => (
          <LineStatusCard key={line.code} line={line} />
        ))}
      </Stack>
    </Stack>
  )
}

export default SignCollectionStatusModal
