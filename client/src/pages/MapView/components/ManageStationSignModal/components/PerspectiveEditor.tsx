import * as d3 from 'd3'
import { useEffect, useRef, useState } from 'react'

interface Coord {
  x: number
  y: number
}

export interface Coords {
  topLeft: Coord
  topRight: Coord
  bottomRight: Coord
  bottomLeft: Coord
}

interface PerspectiveEditorProps {
  imageDataUrl: string
  imageWidth: number
  imageHeight: number
  coords: Coords
  onCoordsChange: (coords: Coords) => void
}

function validateCoords(coords: Coords, imgW: number, imgH: number): string | null {
  for (const p of Object.values(coords)) {
    if (p.x < 0 || p.x > imgW || p.y < 0 || p.y > imgH) {
      return 'Points must be within image bounds'
    }
  }

  const points = [
    coords.topLeft,
    coords.topRight,
    coords.bottomRight,
    coords.bottomLeft
  ] as const

  const [topLeft, topRight, bottomRight, bottomLeft] = points

  const crossProduct = (o: Coord, a: Coord, b: Coord) =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)

  const signs = [
    crossProduct(topLeft, topRight, bottomRight),
    crossProduct(topRight, bottomRight, bottomLeft),
    crossProduct(bottomRight, bottomLeft, topLeft),
    crossProduct(bottomLeft, topLeft, topRight)
  ]

  const pos = signs.every(s => s > 0)
  const neg = signs.every(s => s < 0)

  if (!pos && !neg) {
    return 'Points must form a convex quadrilateral'
  }

  const area =
    Math.abs(
      (topLeft.x * topRight.y -
        topRight.x * topLeft.y +
        topRight.x * bottomRight.y -
        bottomRight.x * topRight.y +
        bottomRight.x * bottomLeft.y -
        bottomLeft.x * bottomRight.y +
        bottomLeft.x * topLeft.y -
        topLeft.x * bottomLeft.y) /
        2
    )

  if (area < imgW * imgH * 0.01) {
    return 'Selected area is too small'
  }

  return null
}

export { validateCoords }

const MAGNIFIER_ZOOM = 3

function PerspectiveEditor({
  imageDataUrl,
  imageWidth,
  imageHeight,
  coords,
  onCoordsChange
}: PerspectiveEditorProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const coordsRef = useRef(coords)
  const dimsRef = useRef({ imageWidth, imageHeight })
  const clipPathId = useRef(`mag-${Math.random().toString(36).slice(2, 8)}`)
  const [containerWidth, setContainerWidth] = useState(0)

  coordsRef.current = coords
  dimsRef.current = { imageWidth, imageHeight }

  useEffect(() => {
    const svg = svgRef.current

    if (!svg) return

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width)
      }
    })

    observer.observe(svg.parentElement!)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!containerWidth) return

    const svg = d3.select(svgRef.current)

    svg.selectAll('*').remove()

    const g = svg.append('g')

    g.append('image')
      .attr('href', imageDataUrl)
      .attr('width', imageWidth)
      .attr('height', imageHeight)

    const keys = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'] as const

    const scale = containerWidth / imageWidth
    const tapTarget = 10
    const radius = Math.max(10, Math.min(tapTarget / scale, 120))
    const strokeW = Math.max(2, Math.min(3 / scale, 5))
    const fontSize = Math.max(11, Math.min(16 / scale, 18))
    const labelDx = radius * 2
    const labelDy = -radius * 1.5
    const labelStrokeW = Math.max(2, Math.min(3 / scale, 5))

    const polygon = g
      .append('polygon')
      .attr('fill', 'rgba(0, 120, 255, 0.15)')
      .attr('stroke', '#0078ff')
      .attr('stroke-width', strokeW)

    const updatePolygon = () => {
      const c = coordsRef.current

      polygon.attr(
        'points',
        `${c.topLeft.x},${c.topLeft.y} ${c.topRight.x},${c.topRight.y} ${c.bottomRight.x},${c.bottomRight.y} ${c.bottomLeft.x},${c.bottomLeft.y}`
      )
    }

    updatePolygon()

    const magTargetRadius = 65
    const magRadius = Math.min(magTargetRadius / scale, 250)

    svg.append('defs')
      .append('clipPath')
      .attr('id', clipPathId.current)
      .append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', magRadius)

    const magnifier = svg.append('g').attr('visibility', 'hidden')

    magnifier.append('circle')
      .attr('r', magRadius)
      .attr('fill', '#1a1a2e')
      .attr('opacity', 0.92)

    const magImageGroup = magnifier.append('g')
      .attr('clip-path', `url(#${clipPathId.current})`)

    const magImage = magImageGroup.append('image')
      .attr('href', imageDataUrl)
      .attr('width', imageWidth)
      .attr('height', imageHeight)

    magnifier.append('circle')
      .attr('r', magRadius)
      .attr('fill', 'none')
      .attr('stroke', '#0078ff')
      .attr('stroke-width', 2.5)

    const crossLen = Math.max(8, Math.min(12 / scale, 28))
    const crossDotR = Math.max(2, Math.min(3 / scale, 6))
    const crossStroke = Math.max(1.5, Math.min(2 / scale, 3.5))

    for (const { x1, y1, x2, y2 } of [
      { x1: -crossLen, y1: 0, x2: crossLen, y2: 0 },
      { x1: 0, y1: -crossLen, x2: 0, y2: crossLen }
    ]) {
      magnifier.append('line')
        .attr('x1', x1).attr('y1', y1)
        .attr('x2', x2).attr('y2', y2)
        .attr('stroke', '#ffffff')
        .attr('stroke-width', crossStroke)
        .attr('stroke-linecap', 'round')
    }

    magnifier.append('circle')
      .attr('r', crossDotR)
      .attr('fill', '#ffffff')

    function updateMagnifier(px: number, py: number) {
      let dx = magRadius * 0.3

      const dy = -magRadius * 2.5

      if (px > imageWidth * 0.5) {
        dx = -magRadius * 2.2
      }

      const mx = px + dx
      const my = py + dy

      magnifier
        .attr('transform', `translate(${mx}, ${my})`)
        .attr('visibility', 'visible')

      magImage.attr(
        'transform',
        `translate(${-px * MAGNIFIER_ZOOM}, ${-py * MAGNIFIER_ZOOM}) scale(${MAGNIFIER_ZOOM})`
      )
    }

    keys.forEach(key => {
      const circle = g
        .append('circle')
        .attr('cx', coords[key].x)
        .attr('cy', coords[key].y)
        .attr('r', radius)
        .attr('fill', '#ffffff')
        .attr('stroke', '#0078ff')
        .attr('stroke-width', strokeW)
        .style('cursor', 'move')

      const label = g
        .append('text')
        .attr('x', coords[key].x + labelDx)
        .attr('y', coords[key].y + labelDy)
        .attr('fill', '#ffffff')
        .attr('font-size', fontSize)
        .attr('stroke', '#000000')
        .attr('stroke-width', labelStrokeW)
        .attr('paint-order', 'stroke')
        .text(`${Math.round(coords[key].x)}, ${Math.round(coords[key].y)}`)

      const drag = d3
        .drag<SVGCircleElement, unknown>()
        .on('start', function () {
          const cx = parseFloat(d3.select(this).attr('cx'))
          const cy = parseFloat(d3.select(this).attr('cy'))
          updateMagnifier(cx, cy)
          magnifier.attr('visibility', 'visible')
        })
        .on('drag', function (event) {
          const { imageWidth: w, imageHeight: h } = dimsRef.current

          const newX = Math.max(0, Math.min(w, event.x))
          const newY = Math.max(0, Math.min(h, event.y))

          d3.select(this).attr('cx', newX).attr('cy', newY)

          const newCoords = { ...coordsRef.current }

          newCoords[key] = { x: Math.round(newX), y: Math.round(newY) }
          coordsRef.current = newCoords
          onCoordsChange(newCoords)

          label
            .attr('x', newX + labelDx)
            .attr('y', newY + labelDy)
            .text(`${Math.round(newX)}, ${Math.round(newY)}`)

          updatePolygon()
          updateMagnifier(newX, newY)
        })
        .on('end', function () {
          magnifier.attr('visibility', 'hidden')
        })

      circle.call(drag as never)
    })

    return () => {
      svg.selectAll('*').remove()
    }
  }, [imageDataUrl, containerWidth])

  return (
    <svg
      ref={svgRef}
      style={{ maxWidth: '100%', borderRadius: '0.5rem' }}
      viewBox={`0 0 ${imageWidth} ${imageHeight}`}
    />
  )
}

export default PerspectiveEditor
