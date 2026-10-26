/* eslint-disable local/no-native-elements */
import { useState } from 'react'

import { Box, Card, Flex } from '@lifeforge/ui'

import { useSignCollectionStatus } from '@/pages/MapView/components/SignCollectionStatusModal/hooks/useSignCollectionStatus'
import { useRailwayMapContext } from '@/providers/RailwayMapProvider'

import MapLineFilter from './components/MapLineFilter'
import MapStationSearch from './components/MapStationSearch'
import { useRailwayMapRenderer } from './hooks/useRailwayMapRenderer'

export default function MapTab() {
  const {
    map,
    routeMapSVGRef: svgRef,
    routeMapGRef: gRef,
    setSelectedStation
  } = useRailwayMapContext()

  const [hiddenLines, setHiddenLines] = useState<string[]>([])
  const [showCollectionStatus, setShowCollectionStatus] = useState(false)
  const { collectedCodes } = useSignCollectionStatus(map.stations, map.lines)

  useRailwayMapRenderer({
    hiddenLines,
    showCollectionStatus,
    collectedCodes
  })

  const toggleLine = (lineCode: string) => {
    setHiddenLines(prev =>
      prev.includes(lineCode)
        ? prev.filter(code => code !== lineCode)
        : [...prev, lineCode]
    )
  }

  return (
    <Flex direction="column" flex="1" gap="md" mb="lg" minHeight="0">
      <Flex align="center" gap="md">
        <Box flex="1" minWidth="0">
          <MapStationSearch />
        </Box>
        <MapLineFilter
          hiddenLines={hiddenLines}
          lines={map.lines}
          showCollectionStatus={showCollectionStatus}
          onToggleCollectionStatus={() =>
            setShowCollectionStatus(prev => !prev)
          }
          onToggleLine={toggleLine}
        />
      </Flex>
      <Card flex="1" minHeight="0">
        <svg
          ref={svgRef}
          height="100%"
          style={{ touchAction: 'none', userSelect: 'none' }}
          width="100%"
          onClick={() => {
            setSelectedStation(null)
          }}
        >
          <g ref={gRef}></g>
        </svg>
      </Card>
    </Flex>
  )
}
