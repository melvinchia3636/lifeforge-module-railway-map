import * as d3 from 'd3'

import type { MapStation } from '@/providers/RailwayMapProvider'

function renderStationLabel({
  stationGroup,
  station,
  bgTempPalette,
  darkMode
}: {
  stationGroup: d3.Selection<SVGGElement, unknown, null, undefined>
  station: MapStation
  bgTempPalette: Record<number, string>
  darkMode: boolean
}) {
  stationGroup
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('fill', bgTempPalette[darkMode ? 100 : 800]!)
    .attr('font-size', 11)
    .attr('font-family', 'LTAIdentityMedium')
    .attr('white-space', 'pre')
    .each(
      (
        _d: unknown,
        i: number,
        nodes: SVGTextElement[] | ArrayLike<SVGTextElement>
      ) => {
        const domNode = nodes[i]

        if (!domNode) return

        const textElement = d3.select(domNode)

        const lines = station.name.split('\\n')

        lines.forEach((line: string, idx: number) => {
          textElement
            .append('tspan')
            .attr('x', 0)
            .attr('dy', idx === 0 ? '0em' : '1.2em')
            .text(line)
        })

        const bbox = domNode.getBBox()
        const W = bbox.width
        const baseX = station.x + (station.textOffsetX || 0)
        const baseY = station.y + (station.textOffsetY || 0)

        let targetX = baseX
        let targetY = baseY

        const anchor = station.textAnchor || 'top-left'

        if (anchor.endsWith('-left')) {
          targetX = baseX + W / 2
        } else if (anchor.endsWith('-center') || anchor === 'center') {
          targetX = baseX
        } else if (anchor.endsWith('-right')) {
          targetX = baseX - W / 2
        }

        const N = lines.length

        if (anchor.startsWith('top-')) {
          targetY = baseY + 7
        } else if (anchor.startsWith('middle-') || anchor === 'center') {
          targetY = baseY - ((N - 1) * 12 - 7) / 2
        } else if (anchor.startsWith('bottom-')) {
          targetY = baseY - (N - 1) * 12
        }

        textElement.attr('x', targetX).attr('y', targetY)
        textElement.selectAll('tspan').attr('x', targetX)
      }
    )
}

export default renderStationLabel
