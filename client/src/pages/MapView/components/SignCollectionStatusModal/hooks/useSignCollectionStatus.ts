import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import type { MapLine, MapStation } from '@/providers/RailwayMapProvider'
import { filterStationCode } from '@/utils/filterStationCode'

import { forgeAPI } from '@/manifest'

export function useSignCollectionStatus(
  stations: MapStation[],
  lines: MapLine[],
  lineCompletedAt: Record<string, string> = {}
) {
  const signsQuery = useQuery(forgeAPI.signs.list.queryOptions())

  const signs = signsQuery.data ?? []

  const collectedCodes = useMemo(
    () => new Set(signs.map(s => s.station_code)),
    [signs]
  )

  const lineStatuses = useMemo(() => {
    return lines
      .map(line => {
        const lineStations = stations.filter(s => s.lines.includes(line.code))

        const codes: string[] = []

        for (const station of lineStations) {
          if (!station.codes) continue

          const filtered = filterStationCode(station.codes, line.code)
          codes.push(...filtered)
        }

        const uniqueCodes = [...new Set(codes)]
        const collected = uniqueCodes.filter(c => collectedCodes.has(c)).length
        const total = uniqueCodes.length

        return {
          code: line.code,
          name: line.name,
          color: line.color,
          collected,
          total,
          percentage: total > 0 ? Math.round((collected / total) * 100) : 0,
          completedAt: lineCompletedAt[line.code]
        }
      })
      .sort(
        (a, b) => Number(b.percentage === 100) - Number(a.percentage === 100)
      )
  }, [lines, stations, collectedCodes, lineCompletedAt])

  const { totalCodes, collectedTotal } = useMemo(() => {
    const total = lineStatuses.reduce((sum, l) => sum + l.total, 0)
    const collected = lineStatuses.reduce((sum, l) => sum + l.collected, 0)

    return { totalCodes: total, collectedTotal: collected }
  }, [lineStatuses])

  const overallPercentage =
    totalCodes > 0 ? Math.round((collectedTotal / totalCodes) * 100) : 0

  return {
    collectedCodes,
    lineStatuses,
    totalCodes,
    collectedTotal,
    overallPercentage
  }
}
