import { useMemo } from 'react'

import { Scrollbar, Stack } from '@lifeforge/ui'

import { useRailwayMapContext } from '@/providers/RailwayMapProvider'
import { filterStationCode } from '@/utils/filterStationCode'

import StationsTabHeader from './components/StationsTabHeader'
import { StationsTabProvider } from './contexts/StationsTabContext'
import useFilter from './hooks/useFilter'
import { ViewMode } from './views'
import GridView from './views/GridView'
import ListView from './views/ListView'

function StationsTabContent() {
  const { map } = useRailwayMapContext()
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
      <Scrollbar>
        <Stack mb="lg">
          <ViewMode.When mode="list">
            <ListView stations={sorted} />
          </ViewMode.When>
          <ViewMode.When mode="grid">
            <GridView stations={sorted} />
          </ViewMode.When>
        </Stack>
      </Scrollbar>
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
