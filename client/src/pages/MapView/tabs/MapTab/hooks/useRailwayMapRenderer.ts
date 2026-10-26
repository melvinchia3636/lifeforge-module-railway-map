import * as d3 from 'd3'
import { useEffect, useRef, useState } from 'react'
import tinycolor from 'tinycolor2'

import { usePersonalization } from '@lifeforge/ui'

import { useRailwayMapContext } from '@/providers/RailwayMapProvider'
import type { MapLine, MapStation } from '@/providers/RailwayMapProvider'
import renderLines from '../renderer/renderLines'
import renderStations from '../renderer/renderStations'
import { getStationStatusColor } from '../utils/getStationStatusColor'
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
  const labelWidthCacheRef = useRef(new Map<string, number>())
  const [labelEpoch, setLabelEpoch] = useState(0)

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
    const handleFontsLoaded = () => {
      labelWidthCacheRef.current.clear()
      setLabelEpoch(epoch => epoch + 1)
    }

    document.fonts.addEventListener('loadingdone', handleFontsLoaded)

    return () => {
      document.fonts.removeEventListener('loadingdone', handleFontsLoaded)
    }
  }, [])

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
      collectedCodes,
      labelWidthCache: labelWidthCacheRef.current
    })
  }, [map, bgTempPalette, darkMode, hiddenLines, labelEpoch])

  useEffect(() => {
    if (!gRef.current || !isInitializedRef.current) return

    const g = d3.select(gRef.current)
    const selectedId = selectedStation?.id ?? null
    const selectedStroke = darkMode ? '#ffffff' : '#000000'
    const defaultStroke = bgTempPalette[darkMode ? 900 : 100]!

    g.selectAll<SVGGElement, MapStation>('g.station-group').each(
      function (station) {
        const group = d3.select(this)
        const isSelected = station.id === selectedId

        group
          .select('.station-outline')
          .attr('stroke', isSelected ? selectedStroke : defaultStroke)
          .attr('stroke-width', isSelected ? 4 : 2)

        group
          .select('.station-single-badge')
          .attr('stroke', isSelected ? selectedStroke : defaultStroke)
          .attr('stroke-width', isSelected ? 2.5 : 1)
      }
    )
  }, [selectedStation, darkMode, bgTempPalette])

  useEffect(() => {
    if (!gRef.current || !isInitializedRef.current) return

    const g = d3.select(gRef.current)

    g.selectAll<SVGGElement, MapStation>('g.station-group').each(
      function (station) {
        const group = d3.select(this)
        const statusColor = getStationStatusColor(station, collectedCodes)
        const statusTextColor = tinycolor(statusColor).isDark()
          ? '#ffffff'
          : '#000000'
        const badgeColor = showCollectionStatus ? statusColor : null

        group
          .selectAll<SVGPathElement, unknown>('.station-code-badge')
          .each(function () {
            const badge = d3.select(this)

            badge.attr('fill', badgeColor ?? badge.attr('data-line-color'))
          })

        group
          .selectAll<SVGTextElement, unknown>('.station-code-text')
          .each(function () {
            const text = d3.select(this)

            text.attr(
              'fill',
              badgeColor ? statusTextColor : text.attr('data-line-color')
            )
          })
      }
    )
  }, [showCollectionStatus, collectedCodes])
}
