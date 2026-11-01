import { type RelationsBuilder } from 'drizzle-orm'
import { jsonb, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { createModuleTable } from '@lifeforge/drizzle'

const pgTable = createModuleTable()

export interface RailwayLine {
  color: string
  name: string
  code: string
  path: number[][]
}

export interface RailwayStation {
  id: string
  x: number
  y: number
  name: string
  lines: string[]
  type: 'station' | 'interchange'
  codes?: string[]
  textOffsetX?: number
  textOffsetY?: number
  textAnchor?: string
}

/** Line code -> ISO timestamp of the moment the line was completed. */
export type LineCompletionDates = Record<string, string>

export interface CropCoords {
  topLeft: { x: number; y: number }
  topRight: { x: number; y: number }
  bottomRight: { x: number; y: number }
  bottomLeft: { x: number; y: number }
}

export const railwayMaps = pgTable('map', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().default(''),
  country: text('country').notNull().default(''),
  lines: jsonb('lines').$type<RailwayLine[]>().notNull().default([]),
  stations: jsonb('stations').$type<RailwayStation[]>().notNull().default([]),
  line_completed_at: jsonb('line_completed_at')
    .$type<LineCompletionDates>()
    .notNull()
    .default({}),
  created: timestamp('created', { mode: 'date' }).defaultNow().notNull(),
  updated: timestamp('updated', { mode: 'date' }).defaultNow().notNull()
})

export const stationSigns = pgTable('station_sign_collection', {
  id: uuid('id').defaultRandom().primaryKey(),
  image: text('image').notNull().default(''),
  station_code: text('station_code').notNull().default(''),
  cropped_image: text('cropped_image').notNull().default(''),
  crop_coords: jsonb('crop_coords').$type<CropCoords | null>(),
  created: timestamp('created', { mode: 'date' }).defaultNow().notNull(),
  updated: timestamp('updated', { mode: 'date' }).defaultNow().notNull()
})

export const tables = {
  map: railwayMaps,
  station_sign_collection: stationSigns
}

export const relations = (_r: RelationsBuilder<typeof tables>) => ({})
