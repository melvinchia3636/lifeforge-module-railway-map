import { eq } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'

import type { BuiltModuleSchema } from '@lifeforge/drizzle'

import * as schema from '../schema.drizzle'
import { railwayMaps, stationSigns } from '../schema.drizzle'
import { refreshLineCompletionDates } from './lineCompletion'

export type ModuleDb = PostgresJsDatabase<BuiltModuleSchema<typeof schema>>

/** Recomputes and persists `line_completed_at` for every railway map. */
export async function syncLineCompletionDates(db: ModuleDb): Promise<void> {
  const [maps, signs] = await Promise.all([
    db.select().from(railwayMaps),
    db
      .select({
        station_code: stationSigns.station_code,
        created: stationSigns.created
      })
      .from(stationSigns)
  ])

  const collectedAtByCode = new Map<string, Date>()

  for (const sign of signs) {
    const current = collectedAtByCode.get(sign.station_code)

    if (!current || sign.created > current) {
      collectedAtByCode.set(sign.station_code, sign.created)
    }
  }

  for (const map of maps) {
    const next = refreshLineCompletionDates({
      lines: map.lines,
      stations: map.stations,
      existing: map.line_completed_at,
      collectedAtByCode
    })

    if (!next) continue

    await db
      .update(railwayMaps)
      .set({ line_completed_at: next, updated: new Date() })
      .where(eq(railwayMaps.id, map.id))
  }
}
