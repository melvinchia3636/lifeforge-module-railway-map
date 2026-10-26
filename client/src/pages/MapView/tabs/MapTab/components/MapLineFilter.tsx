import { useModuleTranslation } from '@lifeforge/localization'
import {
  Box,
  ContextMenu,
  ContextMenuGroup,
  ContextMenuItem
} from '@lifeforge/ui'

import type { MapLine } from '@/providers/RailwayMapProvider'

function MapLineFilter({
  lines,
  hiddenLines,
  showCollectionStatus,
  onToggleLine,
  onToggleCollectionStatus
}: {
  lines: MapLine[]
  hiddenLines: string[]
  showCollectionStatus: boolean
  onToggleLine: (lineCode: string) => void
  onToggleCollectionStatus: () => void
}) {
  const { t } = useModuleTranslation()

  return (
    <ContextMenu
      componentProps={{
        menu: {
          minWidth: '22em'
        }
      }}
    >
      <ContextMenuItem
        checked={showCollectionStatus}
        icon="tabler:palette"
        label={t('misc.showCollectionStatus')}
        namespace={false}
        shouldCloseMenuOnClick={false}
        onClick={onToggleCollectionStatus}
      />
      <ContextMenuGroup
        icon="tabler:route"
        label={t('railwayLinesSelectorTitle')}
      >
        {lines.map(line => (
          <ContextMenuItem
            key={line.code}
            checked={!hiddenLines.includes(line.code)}
            icon={
              <Box
                flexShrink="0"
                height="0.75em"
                r="full"
                style={{ backgroundColor: line.color }}
                width="0.75em"
              />
            }
            label={line.name}
            namespace={false}
            shouldCloseMenuOnClick={false}
            onClick={() => onToggleLine(line.code)}
          />
        ))}
      </ContextMenuGroup>
    </ContextMenu>
  )
}

export default MapLineFilter
