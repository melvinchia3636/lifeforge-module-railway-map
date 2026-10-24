import { useModuleTranslation } from '@lifeforge/localization'
import {
  Box,
  ContextMenu,
  ContextMenuGroup,
  ContextMenuItem,
  Flex,
  Icon,
  Listbox,
  ListboxOption,
  SearchInput,
  Text,
  surface
} from '@lifeforge/ui'

import LineBadge from '../../../components/LineBadge'
import { useStationsTabContext } from '../contexts/StationsTabContext'
import useFilter from '../hooks/useFilter'
import { ViewMode } from '../views'

function StationsTabHeader() {
  const { t } = useModuleTranslation()
  const { lines } = useStationsTabContext()

  const {
    searchQuery,
    setSearchQuery,
    line: lineFilter,
    sort,
    updateFilter
  } = useFilter()

  return (
    <Flex
      align="center"
      as="header"
      direction={{ base: 'column', md: 'row' }}
      gap="md"
      mb="lg"
    >
      <Listbox
        bg={surface.defaultInteractive}
        minWidth="20em"
        renderContent={value => {
          if (value === null || value === '') {
            return <Text truncate>{t('misc.allLines')}</Text>
          }

          const line = lines.find(l => l.code === value)

          return (
            <Flex centered gap="md" minWidth="0">
              <LineBadge code={value} color={line?.color ?? '#888'} />
              <Text truncate align="left">
                {line?.name}
              </Text>
            </Flex>
          )
        }}
        value={lineFilter || null}
        width={{ base: '100%', md: 'auto' }}
        onChange={value => updateFilter('line', value ?? '')}
      >
        <ListboxOption label="misc.allLines" value={null} />
        {lines.map(line => (
          <ListboxOption
            key={line.code}
            label={line.name}
            renderColorAndIcon={() => (
              <Flex centered width="5em">
                <LineBadge code={line.code} color={line.color} />
              </Flex>
            )}
            value={line.code}
          />
        ))}
      </Listbox>
      <Flex align="center" gap="md" width="100%">
        <SearchInput
          flex="1"
          searchTarget="station"
          value={searchQuery}
          onChange={setSearchQuery}
        />
        <Box display={{ base: 'block', md: 'none' }}>
          <ContextMenu>
            <ViewMode.ContextMenuSelector />
            <ContextMenuGroup
              icon="tabler:filter"
              label={t(`sortTypes.sortBy`)}
            >
              <ContextMenuItem
                checked={sort === 'name'}
                icon="tabler:abc"
                label="sortTypes.name"
                onClick={() => updateFilter('sort', 'name')}
              />
              <ContextMenuItem
                checked={sort === 'code'}
                icon="tabler:number-123"
                label="sortTypes.stationCode"
                onClick={() => updateFilter('sort', 'stationCode')}
              />
            </ContextMenuGroup>
          </ContextMenu>
        </Box>
      </Flex>
      <Listbox
        display={{ base: 'none', md: 'flex' }}
        minWidth="16em"
        renderContent={value => (
          <Flex align="center" gap="md" minWidth="0">
            <Icon color="muted" icon="tabler:filter" />
            <Text truncate>{t(`sortTypes.${value}`)}</Text>
          </Flex>
        )}
        value={sort}
        onChange={value => updateFilter('sort', value)}
      >
        <ListboxOption label={t(`sortTypes.name`)} value="name" />
        <ListboxOption label={t(`sortTypes.stationCode`)} value="stationCode" />
      </Listbox>
      <ViewMode.Selector />
    </Flex>
  )
}

export default StationsTabHeader
