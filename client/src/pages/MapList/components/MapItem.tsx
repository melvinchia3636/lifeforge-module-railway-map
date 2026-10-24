import countries from 'i18n-iso-countries'
import english from 'i18n-iso-countries/langs/en.json'
import { Link } from 'react-router'

import type { InferOutput } from '@lifeforge/api'
import { useModuleTranslation } from '@lifeforge/localization'
import { Box, Card, Flex, Icon, Text } from '@lifeforge/ui'

import { forgeAPI } from '@/manifest'

import MapPreview from './MapPreview'

countries.registerLocale(english)

type MapListItem = InferOutput<typeof forgeAPI.maps.list>[number]

function MapItem({ map }: { map: MapListItem }) {
  const { t } = useModuleTranslation()

  return (
    <Card
      key={map.id}
      isInteractive
      as={Link}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
      to={`./map/${map.id}`}
    >
      <MapPreview lines={map.lines} stations={map.stations} />
      <Flex align="center" gap="md">
        <Icon icon={`circle-flags:${map.country}`} size="2.5em" />
        <Box>
          <Text as="p" color="primary" weight="medium">
            {countries.getName(map.country.toUpperCase(), 'en', {
              select: 'official'
            })}
          </Text>
          <Text as="p" size="lg" weight="medium">
            {map.name}
          </Text>
          <Text as="p" color="muted">
            {t('misc.counts', {
              lineCount: map.lineCount,
              stationCount: map.stationCount
            })}
          </Text>
        </Box>
      </Flex>
    </Card>
  )
}

export default MapItem
