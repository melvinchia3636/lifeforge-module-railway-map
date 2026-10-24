function roundedPolygon(
  points: { x: number; y: number }[],
  radius: number
): string {
  const [firstPoint, secondPoint] = points

  if (!firstPoint) return ''
  if (points.length === 1) return `M ${firstPoint.x},${firstPoint.y}`
  if (!secondPoint) return ''
  if (points.length === 2)
    return `M ${firstPoint.x},${firstPoint.y} L ${secondPoint.x},${secondPoint.y}`

  const qb: { x: number; y: number }[] = []

  for (let index = 0; index < points.length; index++) {
    const first = points[index]
    const second = points[(index + 1) % points.length]

    if (!first || !second) continue

    const distance = Math.hypot(first.x - second.x, first.y - second.y)
    const ratio = radius / distance
    const dx = (second.x - first.x) * ratio
    const dy = (second.y - first.y) * ratio

    qb.push({ x: first.x + dx, y: first.y + dy })
    qb.push({ x: second.x - dx, y: second.y - dy })
  }

  const [qbStart, qbNext] = qb

  if (!qbStart || !qbNext) return ''

  let path = `M ${qbStart.x}, ${qbStart.y} L ${qbNext.x}, ${qbNext.y}`

  for (let index = 1; index < points.length; index++) {
    const point = points[index]
    const before = qb[index * 2]
    const after = qb[index * 2 + 1]

    if (!point || !before || !after) continue

    path += ` Q ${point.x},${point.y} ${before.x}, ${before.y}`
    path += ` L ${after.x}, ${after.y}`
  }

  path += ` Q ${firstPoint.x},${firstPoint.y} ${qbStart.x}, ${qbStart.y} Z`

  return path
}

export default roundedPolygon
