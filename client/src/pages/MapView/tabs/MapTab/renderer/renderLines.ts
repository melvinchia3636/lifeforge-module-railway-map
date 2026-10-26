import * as d3 from 'd3'

import type { MapLine } from '@/providers/RailwayMapProvider'

import roundedPolygon from './roundedPolygon'

const linePathCache = new WeakMap<MapLine, string>()

function renderLines({
  g,
  lines
}: {
  g: d3.Selection<SVGGElement, unknown, null, undefined>
  lines: MapLine[]
}) {
  for (const [index, line] of lines.entries()) {
    if (line.path.length === 0) continue

    let path = linePathCache.get(line)

    if (!path) {
      path = roundedPolygon(
        line.path
          .filter((p): p is [number, number] => p.length >= 2)
          .map(([x, y]) => ({ x, y })),
        5
      )
      linePathCache.set(line, path)
    }

    g.append('path')
      .attr('class', `line-path-${index}`)
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke', line.color)
      .attr('stroke-width', 5)
      .attr('stroke-linecap', 'round')
  }
}

export default renderLines
