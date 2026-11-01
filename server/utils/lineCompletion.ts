import type {
  LineCompletionDates,
  RailwayLine,
  RailwayStation
} from '../schema.drizzle'

function matchesLine(code: string, lineCode: string): boolean {
  const cleanCode = (code.split(/\d/)[0] ?? '').toLowerCase()
  const cleanFilter = (lineCode.split(/\d/)[0] ?? '').toLowerCase()

  return cleanCode.startsWith(cleanFilter) || cleanFilter.startsWith(cleanCode)
}

/** Station codes that belong to a line, deduplicated. */
export function getLineCodes(
  stations: RailwayStation[],
  lineCode: string
): string[] {
  const codes: string[] = []

  for (const station of stations) {
    if (!station.lines.includes(lineCode) || !station.codes) continue

    for (const code of station.codes) {
      if (matchesLine(code, lineCode)) {
        codes.push(code)
      }
    }
  }

  return [...new Set(codes)]
}

/**
 * Recomputes the completion dates of a map's lines:
 * - a complete line without a date gets the time its newest sign was collected
 * - a line that is no longer complete loses its date
 *
 * Existing dates are preserved so the original completion moment is never
 * overwritten. Returns `null` when nothing changes.
 */
export function refreshLineCompletionDates({
  lines,
  stations,
  existing,
  collectedAtByCode
}: {
  lines: RailwayLine[]
  stations: RailwayStation[]
  existing: LineCompletionDates
  collectedAtByCode: Map<string, Date>
}): LineCompletionDates | null {
  const next: LineCompletionDates = {}

  let changed = false

  for (const line of lines) {
    const codes = getLineCodes(stations, line.code)

    const complete =
      codes.length > 0 && codes.every(code => collectedAtByCode.has(code))

    if (!complete) {
      if (existing[line.code] !== undefined) {
        changed = true
      }

      continue
    }

    const previous = existing[line.code]

    if (previous !== undefined) {
      next[line.code] = previous
      continue
    }

    let completedAt: Date | undefined

    for (const code of codes) {
      const at = collectedAtByCode.get(code)

      if (at && (!completedAt || at > completedAt)) {
        completedAt = at
      }
    }

    next[line.code] = (completedAt ?? new Date()).toISOString()
    changed = true
  }

  return changed ? next : null
}
