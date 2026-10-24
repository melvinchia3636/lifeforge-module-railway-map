import * as d3 from 'd3'
import { useEffect, useRef } from 'react'

import { Box, surface } from '@lifeforge/ui'

import getBoxPath from '@/pages/MapView/tabs/MapTab/renderer/getBoxPath'
import roundedPolygon from '@/pages/MapView/tabs/MapTab/renderer/roundedPolygon'
import type { MapLine, MapStation } from '@/providers/RailwayMapProvider'

function MapPreview({
  lines,
  stations
}: {
  lines: MapLine[]
  stations: MapStation[]
}) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    if (lines.length === 0) return

    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity

    lines.forEach(line => {
      line.path.forEach(([x, y]) => {
        if (x === undefined || y === undefined) return

        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      })
    })

    if (stations.length > 0) {
      stations.forEach(station => {
        if (station.x < minX) minX = station.x
        if (station.x > maxX) maxX = station.x
        if (station.y < minY) minY = station.y
        if (station.y > maxY) maxY = station.y
      })
    }

    if (minX === Infinity || minY === Infinity) {
      return
    }

    const padding = 20
    const contentWidth = maxX - minX
    const contentHeight = maxY - minY
    const size = Math.max(contentWidth, contentHeight)
    const centerX = minX + contentWidth / 2
    const centerY = minY + contentHeight / 2

    svg.attr(
      'viewBox',
      `${centerX - size / 2 - padding} ${centerY - size / 2 - padding} ${size + 2 * padding} ${size + 2 * padding}`
    )

    const g = svg.append('g')

    lines.forEach(line => {
      if (line.path.length === 0) return

      const pathData = roundedPolygon(
        line.path
          .filter((p): p is [number, number] => p.length >= 2)
          .map(([x, y]) => ({ x, y })),
        5
      )

      g.append('path')
        .attr('d', pathData)
        .attr('fill', 'none')
        .attr('stroke', line.color)
        .attr('stroke-width', 12)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
    })

    if (stations.length > 0) {
      stations.forEach(station => {
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

          g.append('path')
            .attr(
              'd',
              getBoxPath(
                station.x - totalWidth / 2,
                station.y - 7,
                totalWidth,
                14,
                7.0,
                3.8,
                'single'
              )
            )
            .attr('fill', '#ffffff')
            .attr('stroke', '#333333')
            .attr('stroke-width', 2)
            .attr('stroke-linejoin', 'round')
        } else {
          g.append('circle')
            .attr('cx', station.x)
            .attr('cy', station.y)
            .attr('r', 5)
            .attr('fill', '#ffffff')
            .attr('stroke', '#333333')
            .attr('stroke-width', 1.2)
        }
      })
    }
  }, [lines, stations])

  return (
    <Box asChild shadow aspectRatio="1/1" bg={surface.light} p="md" r="md">
      <svg ref={svgRef} />
    </Box>
  )
}

export default MapPreview
