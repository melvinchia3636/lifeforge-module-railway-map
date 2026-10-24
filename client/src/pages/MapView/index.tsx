import countries from 'i18n-iso-countries'
import english from 'i18n-iso-countries/langs/en.json'
import { useNavigate } from 'react-router'

import { useModuleTranslation } from '@lifeforge/localization'
import {
  Box,
  ContextMenu,
  ContextMenuItem,
  Flex,
  GoBackButton,
  Icon,
  Text,
  useModalStore
} from '@lifeforge/ui'

import '@/index.css'
import RailwayMapProvider, {
  useRailwayMapContext
} from '@/providers/RailwayMapProvider'

import SignCollectionStatusModal from './components/SignCollectionStatusModal'
import MapTabbedView from './tabs'
import MapTab from './tabs/MapTab'
import StationsTab from './tabs/StationsTab'

countries.registerLocale(english)

function MapView() {
  const { open } = useModalStore()
  const { t } = useModuleTranslation()
  const navigate = useNavigate()
  const { map } = useRailwayMapContext()

  return (
    <>
      <GoBackButton onClick={() => navigate(-1)} />
      <Flex align="center" gap="lg" justify="between">
        <Flex align="center" gap="md" my="md">
          <Icon icon={`circle-flags:${map.country}`} size="2.5em" />
          <Box>
            <Text as="p" color="primary" weight="medium">
              {countries.getName(map.country.toUpperCase(), 'en', {
                select: 'official'
              })}
            </Text>
            <Text as="p" size="xl" weight="medium">
              {map.name}
            </Text>
            <Text as="p" color="muted">
              {t('misc.counts', {
                lineCount: map.lines.length,
                stationCount: map.stations.length
              })}
            </Text>
          </Box>
        </Flex>
        <ContextMenu
          componentProps={{
            menu: {
              minWidth: '16rem'
            }
          }}
        >
          <ContextMenuItem
            icon="tabler:percentage"
            label="View Sign Collection Status"
            onClick={() =>
              open(SignCollectionStatusModal, {
                stations: map.stations,
                lines: map.lines
              })
            }
          />
        </ContextMenu>
      </Flex>
      <MapTabbedView.Root>
        <MapTabbedView.Selector />
        <Flex direction="column" flex="1" mt="lg">
          <MapTabbedView.When tabId="map">
            <MapTab />
          </MapTabbedView.When>
          <MapTabbedView.When tabId="stations">
            <StationsTab />
          </MapTabbedView.When>
        </Flex>
      </MapTabbedView.Root>
    </>
  )
}

const MapViewWithProvider = () => {
  return (
    <RailwayMapProvider>
      <MapView />
    </RailwayMapProvider>
  )
}

export default MapViewWithProvider
