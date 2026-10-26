import * as d3 from 'd3'

import type { MapStation } from '@/providers/RailwayMapProvider'

let zoomBehavior: d3.ZoomBehavior<Element, unknown>

export function setupZooming(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  centerStation: MapStation
) {
  const svgNode = svg.node()

  if (!svgNode) return

  const { width, height } = svgNode.getBoundingClientRect()
  const { x: centerX, y: centerY } = centerStation
  const initialScale = window.innerWidth < 1280 ? 0.5 : 0.7
  const centerTx = width / 2 - centerX * initialScale
  const centerTy = height / 2 - centerY * initialScale

  zoomBehavior = d3
    .zoom()
    .scaleExtent([0.5, 3])
    .on('zoom', event => {
      g.attr('transform', event.transform)
    })

  svg.call(
    zoomBehavior as unknown as (
      selection: d3.Selection<SVGSVGElement, unknown, null, undefined>
    ) => void
  )
  svg.call(
    zoomBehavior.transform as unknown as (
      selection: d3.Selection<SVGSVGElement, unknown, null, undefined>,
      transform: d3.ZoomTransform
    ) => void,
    d3.zoomIdentity.translate(centerTx, centerTy).scale(initialScale)
  )

  g.attr(
    'transform',
    `translate(${centerTx}, ${centerTy}) scale(${initialScale})`
  )
}

export function centerMapOnStation(
  svgRef: React.RefObject<SVGSVGElement | null>,
  gRef: React.RefObject<SVGGElement | null>,
  station: MapStation,
  centerStation: MapStation,
  scale = 2,
  duration = 1000,
  needZoom = true
) {
  if (!svgRef.current || !gRef.current) return

  const svg = d3.select(svgRef.current)
  const g = d3.select(gRef.current)

  if (svg.empty() || g.empty()) return

  const { x, y } = station
  const { x: centerX, y: centerY } = centerStation
  const svgNode = svg.node()

  if (!svgNode) return

  const { width, height } = svgNode.getBoundingClientRect()
  const initialScale = window.innerWidth < 1280 ? 0.5 : 0.7
  const centerTx = width / 2 - centerX * initialScale
  const centerTy = height / 2 - centerY * initialScale
  const targetTx = width / 2 - x * scale
  const targetTy = height / 2 - y * scale

  const zoomTo = (
    transition: d3.Transition<SVGSVGElement, unknown, null, undefined>,
    transform: d3.ZoomTransform,
    onEnd?: () => void
  ) => {
    transition.call(
      zoomBehavior.transform as unknown as (
        transition: d3.Transition<SVGSVGElement, unknown, null, undefined>,
        transform: d3.ZoomTransform
      ) => void,
      transform
    )

    if (onEnd) {
      transition.on('end', onEnd)
    }
  }

  if (needZoom) {
    zoomTo(
      svg.transition().duration(duration / 2),
      d3.zoomIdentity.translate(centerTx, centerTy).scale(initialScale),
      () => {
        zoomTo(
          svg.transition().duration(duration),
          d3.zoomIdentity.translate(targetTx, targetTy).scale(scale)
        )
      }
    )

    return
  }

  zoomTo(
    svg.transition().duration(duration),
    d3.zoomIdentity.translate(targetTx, targetTy).scale(scale)
  )
}
