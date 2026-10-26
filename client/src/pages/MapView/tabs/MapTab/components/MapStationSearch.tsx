import { useMemo, useState } from 'react'

import { useModuleTranslation } from '@lifeforge/localization'
import { Flex, SearchInput, Text, Transition } from '@lifeforge/ui'

import {
  type MapStation,
  useRailwayMapContext
} from '@/providers/RailwayMapProvider'
import { getLineColor } from '@/utils/getLineColor'

import LineBadge from '../../../components/LineBadge'
import { centerMapOnStation } from '../utils/zoomUtils'

function MapStationSearch() {
  const { t } = useModuleTranslation()

  const {
    map,
    routeMapSVGRef,
    routeMapGRef,
    centerStation,
    setSelectedStation
  } = useRailwayMapContext()

  const [query, setQuery] = useState('')

  const matchedStations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return []
    }

    return (map.stations || [])
      .filter(station =>
        station.name
          .replace(/\\n/g, ' ')
          .toLowerCase()
          .includes(normalizedQuery)
      )
      .slice(0, 8)
  }, [map.stations, query])

  const handleSelectStation = (station: MapStation) => {
    setSelectedStation(station)

    if (centerStation) {
      centerMapOnStation(
        routeMapSVGRef,
        routeMapGRef,
        station,
        centerStation,
        2,
        1000
      )
    }

    setQuery('')
  }

  return (
    <SearchInput
      searchTarget="station"
      showChildrenPolicy="query-not-empty"
      value={query}
      onChange={setQuery}
    >
      {matchedStations.length > 0 ? (
        <Flex direction="column" gap="xs">
          {matchedStations.map(station => (
            <Transition key={station.id}>
              <Flex
                align="center"
                as="button"
                bg={{ hover: 'bg-200', darkHover: 'bg-800' }}
                gap="md"
                justify="between"
                minWidth="0"
                p="md"
                r="md"
                width="100%"
                onClick={() => handleSelectStation(station)}
              >
                <Text truncate weight="medium">
                  {station.name.replace(/\\n/g, ' ')}
                </Text>
                {station.codes && station.codes.length > 0 && (
                  <Flex align="center" flexShrink="0" gap="xs">
                    {station.codes.map(code => (
                      <LineBadge
                        key={code}
                        code={code}
                        color={getLineColor(code, map.lines)}
                      />
                    ))}
                  </Flex>
                )}
              </Flex>
            </Transition>
          ))}
        </Flex>
      ) : (
        <Text align="center" as="div" color="muted" px="md" py="sm">
          {t('misc.noStationsFound')}
        </Text>
      )}
    </SearchInput>
  )
}

export default MapStationSearch
