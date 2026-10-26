import * as d3 from 'd3'

import type { MapStation } from '@/providers/RailwayMapProvider'

export function appendStationLabel<Datum>({
  stationGroup,
  station,
  bgTempPalette,
  darkMode
}: {
  stationGroup: d3.Selection<SVGGElement, Datum, null, undefined>
  station: MapStation
  bgTempPalette: Record<number, string>
  darkMode: boolean
}): d3.Selection<SVGTextElement, Datum, null, undefined> {
  const textElement = stationGroup
    .append('text')
    .attr('class', 'station-label')
    .attr('text-anchor', 'middle')
    .attr('fill', bgTempPalette[darkMode ? 100 : 800]!)
    .attr('font-size', 11)
    .attr('font-family', 'LTAIdentityMedium')
    .attr('white-space', 'pre')

  const lines = station.name.split('\\n')

  lines.forEach((line: string, idx: number) => {
    textElement
      .append('tspan')
      .attr('x', 0)
      .attr('dy', idx === 0 ? '0em' : '1.2em')
      .text(line)
  })

  return textElement
}

export function positionStationLabel<Datum>({
  station,
  textElement,
  width
}: {
  station: MapStation
  textElement: d3.Selection<SVGTextElement, Datum, null, undefined>
  width: number
}) {
  const baseX = station.x + (station.textOffsetX || 0)
  const baseY = station.y + (station.textOffsetY || 0)

  let targetX = baseX
  let targetY = baseY

  const anchor = station.textAnchor || 'top-left'

  if (anchor.endsWith('-left')) {
    targetX = baseX + width / 2
  } else if (anchor.endsWith('-center') || anchor === 'center') {
    targetX = baseX
  } else if (anchor.endsWith('-right')) {
    targetX = baseX - width / 2
  }

  const lineCount = station.name.split('\\n').length

  if (anchor.startsWith('top-')) {
    targetY = baseY + 7
  } else if (anchor.startsWith('middle-') || anchor === 'center') {
    targetY = baseY - ((lineCount - 1) * 12 - 7) / 2
  } else if (anchor.startsWith('bottom-')) {
    targetY = baseY - (lineCount - 1) * 12
  }

  textElement.attr('x', targetX).attr('y', targetY)
  textElement.selectAll('tspan').attr('x', targetX)
}
