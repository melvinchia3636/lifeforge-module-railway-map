import * as d3 from 'd3'
import tinycolor from 'tinycolor2'

import type { MapLine, MapStation } from '@/providers/RailwayMapProvider'

import { centerMapOnStation } from '../utils/zoomUtils'
import getBoxPath from './getBoxPath'
import renderStationLabel from './renderStationLabel'

function renderStations({
  g,
  stations,
  lines,
  bgTempPalette,
  darkMode,
  selectedStation,
  setSelectedStation,
  svgRef,
  gRef,
  centerStation
}: {
  g: d3.Selection<SVGGElement, unknown, null, undefined>
  stations: MapStation[]
  lines: MapLine[]
  bgTempPalette: Record<number, string>
  darkMode: boolean
  selectedStation: MapStation | null
  setSelectedStation: (station: MapStation | null) => void
  svgRef: React.RefObject<SVGSVGElement | null>
  gRef: React.RefObject<SVGGElement | null>
  centerStation: MapStation | undefined
}) {
  for (const station of stations) {
    const isSelected = selectedStation?.id === station.id

    const stationGroup = g
      .append('g')
      .style('cursor', 'pointer')
      .on('click', (event: MouseEvent) => {
        event.stopPropagation()
        setSelectedStation(station)

        if (centerStation) {
          centerMapOnStation(svgRef, gRef, station, centerStation, 2, 1000)
        }
      })

    if (station.type === 'interchange') {
      const codes =
        station.codes && station.codes.length > 0 ? station.codes : ['']
      const gap = 0

      const boxWidths = codes.map((code: string) => {
        return Math.max(18, code.length * 5.4 + 10)
      })
      const totalWidth =
        boxWidths.reduce((a: number, b: number) => a + b, 0) +
        (codes.length - 1) * gap

      stationGroup
        .append('path')
        .attr(
          'd',
          getBoxPath(
            station.x - totalWidth / 2,
            station.y - 7,
            totalWidth,
            14,
            2.5,
            1.2,
            'single'
          )
        )
        .attr('fill', 'none')
        .attr(
          'stroke',
          isSelected
            ? darkMode
              ? '#ffffff'
              : '#000000'
            : bgTempPalette[darkMode ? 900 : 100]!
        )
        .attr('stroke-width', isSelected ? 4 : 2)
        .attr('stroke-linejoin', 'round')

      let currentX = station.x - totalWidth / 2

      codes.forEach((code: string, i: number) => {
        const w = boxWidths[i]

        if (w === undefined) return

        const line = lines.find(l => {
          const cleanLineCode = (l.code.split(/\d/)[0] ?? '').toLowerCase()
          const cleanStationCode = (code.split(/\d/)[0] ?? '').toLowerCase()

          return (
            cleanLineCode.startsWith(cleanStationCode) ||
            cleanStationCode.startsWith(cleanLineCode)
          )
        })
        const color = line?.color || bgTempPalette[darkMode ? 100 : 800]!
        const isDarkColor = line ? tinycolor(color).isDark() : false
        const textColor = isDarkColor ? '#ffffff' : '#000000'

        let position: 'first' | 'middle' | 'last' | 'single' = 'middle'

        if (codes.length === 1) {
          position = 'single'
        } else if (i === 0) {
          position = 'first'
        } else if (i === codes.length - 1) {
          position = 'last'
        }

        stationGroup
          .append('path')
          .attr(
            'd',
            getBoxPath(currentX, station.y - 7, w, 14, 2.5, 1.2, position)
          )
          .attr('fill', color)
          .attr('stroke-linejoin', 'round')

        stationGroup
          .append('text')
          .attr('x', currentX + w / 2)
          .attr('y', station.y + 0.8)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .text(code)
          .attr('font-size', 9)
          .attr('line-height', '1')
          .attr('fill', textColor)
          .attr('font-family', 'LTAIdentityMedium')

        currentX += w + gap
      })
    } else if (station.type === 'station') {
      const textVal = station.codes?.join(', ') || ''
      const line =
        lines.find(l => l.name === station.lines?.[0]) ||
        lines.find(l => {
          const cleanLineCode = (l.code.split(/\d/)[0] ?? '').toLowerCase()
          const firstCode = station.codes?.[0] || ''
          const cleanStationCode = (firstCode.split(/\d/)[0] ?? '').toLowerCase()

          return (
            cleanLineCode.startsWith(cleanStationCode) ||
            cleanStationCode.startsWith(cleanLineCode)
          )
        })
      const lineColor = line?.color || bgTempPalette[darkMode ? 100 : 800]!
      const isDarkLine = line ? tinycolor(lineColor).isDark() : false

      const boxWidth = Math.max(14, textVal.length * 4.2 + 8)

      stationGroup
        .append('path')
        .attr(
          'd',
          getBoxPath(
            station.x - boxWidth / 2,
            station.y - 5.5,
            boxWidth,
            11,
            2.0,
            0.8,
            'single'
          )
        )
        .attr('fill', lineColor)
        .attr(
          'stroke',
          isSelected
            ? darkMode
              ? '#ffffff'
              : '#000000'
            : bgTempPalette[darkMode ? 900 : 100]!
        )
        .attr('stroke-width', isSelected ? 2.5 : 1)
        .attr('stroke-linejoin', 'round')

      stationGroup
        .append('text')
        .attr('x', station.x)
        .attr('y', station.y + 0.6)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .text(textVal)
        .attr('font-size', 7)
        .attr('fill', isDarkLine ? '#ffffff' : '#000000')
        .attr('font-family', 'LTAIdentityMedium')
    }

    renderStationLabel({
      stationGroup,
      station,
      bgTempPalette,
      darkMode
    })
  }
}

export default renderStations
