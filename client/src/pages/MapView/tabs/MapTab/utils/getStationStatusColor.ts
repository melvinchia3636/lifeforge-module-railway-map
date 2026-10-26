import { COLORS } from '@lifeforge/ui'

import type { MapStation } from '@/providers/RailwayMapProvider'

export function getStationStatusColor(
  station: MapStation,
  collectedCodes: Set<string>
): string {
  const totalCodes = station.codes?.length ?? 0
  const collectedCount = (station.codes ?? []).filter(code =>
    collectedCodes.has(code)
  ).length

  if (totalCodes > 0 && collectedCount === totalCodes) {
    return COLORS['green-500']
  }

  if (collectedCount > 0) {
    return COLORS['yellow-500']
  }

  return COLORS['bg-500']
}
