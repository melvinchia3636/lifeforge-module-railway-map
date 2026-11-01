import { asc, eq } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-orm/zod'
import z from 'zod'

import forge from '../forge'
import { railwayMaps } from '../schema.drizzle'

const lineSchema = z.object({
  color: z.string(),
  name: z.string(),
  code: z.string(),
  path: z.array(z.array(z.number()))
})

const stationSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  name: z.string(),
  lines: z.array(z.string()),
  type: z.enum(['station', 'interchange']),
  codes: z.array(z.string()).optional(),
  textOffsetX: z.number().optional(),
  textOffsetY: z.number().optional(),
  textAnchor: z.string().optional()
})

const mapDto = createSelectSchema(railwayMaps).extend({
  lines: z.array(lineSchema),
  stations: z.array(stationSchema),
  line_completed_at: z.record(z.string(), z.string())
})

export const list = forge
  .query({
    description: 'Get all railway maps',
    output: {
      OK: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          country: z.string(),
          lineCount: z.number(),
          stationCount: z.number(),
          lines: z.array(lineSchema),
          stations: z.array(stationSchema)
        })
      )
    }
  })
  .callback(async ({ db, response }) => {
    const rows = await db
      .select()
      .from(railwayMaps)
      .orderBy(asc(railwayMaps.name))

    return response.ok(
      rows.map(e => ({
        id: e.id,
        name: e.name,
        country: e.country,
        lineCount: e.lines.length,
        stationCount: e.stations.length,
        lines: e.lines,
        stations: e.stations
      }))
    )
  })

export const get = forge
  .query({
    description: 'Get railway map data by id',
    input: {
      query: z.object({
        id: forge.existsIn(z.string(), railwayMaps)
      })
    },
    output: {
      OK: mapDto
    }
  })
  .callback(async ({ db, query: { id }, response }) => {
    const map = (await db.query.map.findFirst({ where: { id } }))!

    return response.ok(map)
  })

export const create = forge
  .mutation({
    description: 'Create a new railway map',
    input: {
      body: z.object({
        name: z.string().min(1),
        country: z.string().min(1),
        lines: z.array(lineSchema),
        stations: z.array(stationSchema)
      })
    },
    output: {
      CREATED: mapDto
    }
  })
  .callback(
    async ({ db, body: { name, country, lines, stations }, response }) => {
      const [created] = await db
        .insert(railwayMaps)
        .values({ name, country, lines, stations })
        .returning()

      if (!created) {
        return response.badRequest('Failed to create railway map')
      }

      return response.created(created)
    }
  )

export const update = forge
  .mutation({
    description: 'Update a station name in a railway map',
    input: {
      query: z.object({
        id: forge.existsIn(z.string(), railwayMaps)
      }),
      body: z.object({
        stationId: z.string(),
        name: z.string().min(1)
      })
    },
    output: {
      OK: mapDto
    }
  })
  .callback(
    async ({ db, query: { id }, body: { stationId, name }, response }) => {
      const map = (await db.query.map.findFirst({ where: { id } }))!

      const stations = map.stations.map(s =>
        s.id === stationId ? { ...s, name } : s
      )

      const [updated] = await db
        .update(railwayMaps)
        .set({ stations, updated: new Date() })
        .where(eq(railwayMaps.id, id))
        .returning()

      if (!updated) {
        return response.notFound()
      }

      return response.ok(updated)
    }
  )
