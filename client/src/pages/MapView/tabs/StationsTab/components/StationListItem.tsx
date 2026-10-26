import {
  Card,
  ContextMenu,
  ContextMenuItem,
  Flex,
  Text,
  useModalStore
} from '@lifeforge/ui'

import EditStationNameModal from '@/pages/MapView/components/EditStationNameModal'
import ManageStationSignModal from '@/pages/MapView/components/ManageStationSignModal'
import type { MapStation } from '@/providers/RailwayMapProvider'
import { filterStationCode } from '@/utils/filterStationCode'

import SignImages from './SignImages'
import StationCodes from './StationCodes'
import { useStationsTabContext } from '../contexts/StationsTabContext'
import useFilter from '../hooks/useFilter'

function StationListItem({ station }: { station: MapStation }) {
  const { open } = useModalStore()
  const { stationSignMap, lines, mapId } = useStationsTabContext()
  const { line: lineFilter } = useFilter()

  const signs = filterStationCode(station.codes || [], lineFilter).flatMap(
    code => stationSignMap.get(code) ?? []
  )

  return (
    <Card key={station.id}>
      <Flex align="center" gap="md" justify="between" minWidth="0">
        <Flex
          align={{ base: 'start', md: 'center' }}
          direction={{ base: 'column', md: 'row' }}
          flex="1"
          gap="md"
          minWidth="0"
        >
          {signs.length > 0 && (
            <SignImages
              hasMaxWidth
              display={{ md: 'flex', base: 'none' }}
              lines={lines}
              signs={signs}
            />
          )}
          <StationCodes
            codes={station.codes}
            display={{ base: 'flex', md: 'none' }}
            lineFilter={lineFilter}
            lines={lines}
          />
          <Text truncate display="block" size="xl" weight="medium">
            {station.name.replace(/\\n/g, ' ')}
          </Text>
        </Flex>
        <Flex align="center" gap="md">
          <StationCodes
            codes={station.codes}
            display={{ base: 'none', md: 'flex' }}
            lineFilter={lineFilter}
            lines={lines}
          />
          <ContextMenu>
            <ContextMenuItem
              icon="tabler:pencil"
              label="rename"
              onClick={() =>
                open(EditStationNameModal, {
                  mapId,
                  station
                })
              }
            />
            <ContextMenuItem
              icon="tabler:sign-right"
              label="manage signs"
              onClick={() =>
                open(ManageStationSignModal, {
                  stationCodes: station.codes || [],
                  lines
                })
              }
            />
          </ContextMenu>
        </Flex>
      </Flex>
      {signs.length > 0 && (
        <SignImages
          display={{ md: 'none', base: 'flex' }}
          lines={lines}
          mt="md"
          signs={signs}
        />
      )}
    </Card>
  )
}

export default StationListItem
