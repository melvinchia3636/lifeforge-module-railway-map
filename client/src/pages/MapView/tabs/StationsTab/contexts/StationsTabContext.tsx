import { useQuery } from '@tanstack/react-query'
import { createContext, useContext, useMemo, useState } from 'react'

import type { InferOutput } from '@lifeforge/api'

import { forgeAPI } from '@/manifest'
import { useRailwayMapContext } from '@/providers/RailwayMapProvider'

interface StationsTabContextValue {
  stationSignMap: Map<string, MapStationSign[]>
  lines: { code: string; color: string; name: string }[]
  mapId: string
  showOriginalImage: boolean
  toggleOriginalImage: () => void
}

type MapStationSign = InferOutput<typeof forgeAPI.signs.list>[number]

const StationsTabContext = createContext<StationsTabContextValue | null>(null)

export function StationsTabProvider({
  children
}: {
  children: React.ReactNode
}) {
  const { map } = useRailwayMapContext()
  const signsQuery = useQuery(forgeAPI.signs.list.queryOptions())
  const [showOriginalImage, setShowOriginalImage] = useState(false)

  const stationSignMap = useMemo(() => {
    const signs = signsQuery.data || []
    const map = new Map<string, typeof signs>()

    for (const s of signs) {
      const existing = map.get(s.station_code) || []
      existing.push(s)
      map.set(s.station_code, existing)
    }

    return map
  }, [signsQuery.data])

  const lines = map.lines || []
  const mapId = map.id

  const toggleOriginalImage = () => {
    setShowOriginalImage(prev => !prev)
  }

  return (
    <StationsTabContext
      value={{
        stationSignMap,
        lines,
        mapId,
        showOriginalImage,
        toggleOriginalImage
      }}
    >
      {children}
    </StationsTabContext>
  )
}

export function useStationsTabContext() {
  const ctx = useContext(StationsTabContext)

  if (!ctx) {
    throw new Error(
      'useStationsTabContext must be used within a StationsTabProvider'
    )
  }

  return ctx
}
