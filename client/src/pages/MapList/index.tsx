import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { useModuleTranslation } from '@lifeforge/localization'
import {
  Button,
  EmptyStateScreen,
  FAB,
  Grid,
  ModuleHeader,
  SearchInput,
  WithQuery,
  useModalStore
} from '@lifeforge/ui'

import { forgeAPI } from '@/manifest'

import MapItem from './components/MapItem'
import ModifyMapModal from './components/ModifyMapModal'

function MapList() {
  const { t } = useModuleTranslation()
  const { open } = useModalStore()
  const mapsQuery = useQuery(forgeAPI.maps.list.queryOptions())
  const [query, setQuery] = useState('')

  return (
    <>
      <ModuleHeader
        trailing={
          <Button
            display={{ base: 'none', md: 'flex' }}
            icon="tabler:plus"
            tProps={{
              item: t('items.map')
            }}
            onClick={() => open(ModifyMapModal, {})}
          >
            new
          </Button>
        }
      />
      <SearchInput
        mb="lg"
        searchTarget="map"
        value={query}
        onChange={setQuery}
      />
      <WithQuery query={mapsQuery}>
        {maps =>
          maps.length > 0 ? (
            <Grid
              gap="md"
              mb="lg"
              templateCols="repeat(auto-fill, minmax(280px, 1fr))"
            >
              {maps.map(map => (
                <MapItem key={map.id} map={map} />
              ))}
            </Grid>
          ) : (
            <EmptyStateScreen
              icon="tabler:map-off"
              message={{
                id: 'map'
              }}
            />
          )
        }
      </WithQuery>
      <FAB visibilityBreakpoint="md" onClick={() => open(ModifyMapModal, {})} />
    </>
  )
}

export default MapList
