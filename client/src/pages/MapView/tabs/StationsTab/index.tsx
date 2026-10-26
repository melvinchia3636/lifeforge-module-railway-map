import { useMemo } from 'react'

import { Box, VirtualGrid, createViewMode } from '@lifeforge/ui'

import { useRailwayMapContext } from '@/providers/RailwayMapProvider'
import { filterStationCode } from '@/utils/filterStationCode'

import StationsTabHeader from './components/StationsTabHeader'
import {
  StationsTabProvider,
  useStationsTabContext
} from './contexts/StationsTabContext'
import useFilter from './hooks/useFilter'
import StationGridItem from './components/StationGridItem'
import StationListItem from './components/StationListItem'

export const ViewMode = createViewMode({
  modes: [
    { icon: 'tabler:list', value: 'list' },
    { icon: 'tabler:grid-dots', value: 'grid' }
  ],
  selectorProps: {
    display: { base: 'none', md: 'flex' }
  }
})

function StationsTabContent() {
  const { map } = useRailwayMapContext()
  const { stationSignMap } = useStationsTabContext()
  const { searchQuery, line: lineFilter, sort } = useFilter()

  const sorted = useMemo(() => {
    const stations = map.stations || []

    return [...stations]
      .filter(
        s =>
          (searchQuery === '' ||
            s.name
              .replace(/\n/g, ' ')
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) &&
          (lineFilter === '' || s.lines.includes(lineFilter))
      )
      .sort((a, b) => {
        if (sort === 'stationCode') {
          const aCode = filterStationCode(a.codes || [], lineFilter)[0] ?? ''
          const bCode = filterStationCode(b.codes || [], lineFilter)[0] ?? ''

          const [, aLetters = '', aNumStr = ''] =
            aCode.match(/^([A-Za-z]+)(\d*)/) ?? []
          const [, bLetters = '', bNumStr = ''] =
            bCode.match(/^([A-Za-z]+)(\d*)/) ?? []

          const letterCompare = aLetters.localeCompare(bLetters)

          if (letterCompare !== 0) return letterCompare

          return (parseInt(aNumStr) || 0) - (parseInt(bNumStr) || 0)
        }

        return a.name.localeCompare(b.name)
      })
  }, [map.stations, searchQuery, lineFilter, sort])

  return (
    <ViewMode.Root>
      <StationsTabHeader />
      <ViewMode.When mode="list">
        <Box flex="1" height="100%" minHeight="0" pr="sm" width="100%">
          <VirtualGrid
            defaultRowHeight={110}
            getItemKey={station => station.id}
            itemMinWidth={Number.MAX_SAFE_INTEGER}
            items={sorted}
            remeasureKey={stationSignMap}
            renderItem={station => <StationListItem station={station} />}
          />
        </Box>
      </ViewMode.When>
      <ViewMode.When mode="grid">
        <Box flex="1" height="100%" minHeight="0" pr="sm" width="100%">
          <VirtualGrid
            defaultRowHeight={240}
            getItemKey={station => station.id}
            itemMinWidth={300}
            items={sorted}
            remeasureKey={stationSignMap}
            renderItem={station => <StationGridItem station={station} />}
          />
        </Box>
      </ViewMode.When>
    </ViewMode.Root>
  )
}

function StationsTab() {
  return (
    <StationsTabProvider>
      <StationsTabContent />
    </StationsTabProvider>
  )
}

export default StationsTab
