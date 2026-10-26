/* eslint-disable react-compiler/react-compiler */
import * as d3 from 'd3'
import { useEffect, useRef } from 'react'

import { usePersonalization } from '@lifeforge/ui'

import { useRailwayMapContext } from '@/providers/RailwayMapProvider'
import type { MapLine, MapStation } from '@/providers/RailwayMapProvider'
import renderLines from '../renderer/renderLines'
import renderStations from '../renderer/renderStations'
import { setupZooming } from '../utils/zoomUtils'

function isStationVisible(
  station: MapStation,
  visibleLines: MapLine[]
): boolean {
  const lineNames = station.lines || []
  const codes = station.codes || []

  if (lineNames.length === 0 && codes.length === 0) {
    return true
  }

  if (visibleLines.some(line => lineNames.includes(line.name))) {
    return true
  }

  return codes.some(code => {
    const cleanStationCode = (code.split(/\d/)[0] ?? '').toLowerCase()

    return visibleLines.some(line => {
      const cleanLineCode = (line.code.split(/\d/)[0] ?? '').toLowerCase()

      return (
        cleanLineCode.startsWith(cleanStationCode) ||
        cleanStationCode.startsWith(cleanLineCode)
      )
    })
  })
}

export function useRailwayMapRenderer({
  hiddenLines,
  showCollectionStatus,
  collectedCodes
}: {
  hiddenLines: string[]
  showCollectionStatus: boolean
  collectedCodes: Set<string>
}) {
  const { derivedTheme, bgTempPalette } = usePersonalization()

  const darkMode = derivedTheme === 'dark'

  const {
    map,
    routeMapSVGRef: svgRef,
    routeMapGRef: gRef,
    selectedStation,
    setSelectedStation,
    centerStation
  } = useRailwayMapContext()

  const isInitializedRef = useRef(false)

  const lines = map?.lines || []
  const stations = map?.stations || []

  useEffect(() => {
    if (!svgRef.current || isInitializedRef.current || !centerStation) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const g = svg.append('g')
    gRef.current = g.node() as SVGGElement

    setupZooming(svg, g, centerStation)
    isInitializedRef.current = true

    return () => {
      svg.selectAll('*').remove()
      isInitializedRef.current = false
    }
  }, [svgRef, gRef, centerStation])

  useEffect(() => {
    if (!gRef.current || !isInitializedRef.current) return

    const g = d3.select(gRef.current)
    g.selectAll('*').remove()

    const visibleLines = lines.filter(
      line => !hiddenLines.includes(line.code)
    )
    const visibleStations = stations.filter(station =>
      isStationVisible(station, visibleLines)
    )

    renderLines({
      g,
      lines: visibleLines
    })

    renderStations({
      g,
      stations: visibleStations,
      lines,
      bgTempPalette,
      darkMode,
      selectedStation,
      setSelectedStation,
      svgRef,
      gRef,
      centerStation,
      showCollectionStatus,
      collectedCodes
    })
  }, [
    map,
    bgTempPalette,
    darkMode,
    selectedStation,
    centerStation,
    hiddenLines,
    showCollectionStatus,
    collectedCodes
  ])
}
