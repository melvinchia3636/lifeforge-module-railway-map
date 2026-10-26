import {
  Card,
  ContextMenu,
  ContextMenuItem,
  Flex,
  Stack,
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

function StationGridItem({ station }: { station: MapStation }) {
  const { open } = useModalStore()
  const { stationSignMap, lines, mapId } = useStationsTabContext()
  const { line: lineFilter } = useFilter()

  const signs = filterStationCode(station.codes || [], lineFilter).flatMap(
    code => stationSignMap.get(code) ?? []
  )

  return (
    <Card direction="column" flex="1" gap="sm" minWidth="0">
      <Flex align="center" gap="md" justify="between" minWidth="0">
        <Stack gap="md">
          <StationCodes
            wrap
            codes={station.codes}
            lineFilter={lineFilter}
            lines={lines}
          />
          <Text truncate display="block" size="xl" weight="medium">
            {station.name.replace(/\\n/g, ' ')}
          </Text>
        </Stack>
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
      {signs.length > 0 && <SignImages lines={lines} mt="sm" signs={signs} />}
    </Card>
  )
}

export default StationGridItem
