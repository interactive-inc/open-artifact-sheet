import { zValidator } from "@hono/zod-validator"
import { eq } from "drizzle-orm"
import { HTTPException } from "hono/http-exception"
import { z } from "zod"
import { factory } from "@/api/interface/factory"
import { tables } from "@/schema"
import type { AppSheet } from "@/types"
import { toUnixTime } from "@/utils/to-unix-time"

/**
 * GET /tables - List all tables
 */
export const GET = factory.createHandlers(async (c) => {
  const tables = await c.var.database.query.tables.findMany({
    orderBy(schema, ops) {
      return ops.asc(schema.order)
    },
    where(schema, ops) {
      return ops.isNull(schema.deletedAt)
    },
  })

  const nodes = tables.map((table): AppSheet => {
    return {
      id: table.id,
      name: table.name,
      order: table.order,
      deletedAt: table.deletedAt ? toUnixTime(table.deletedAt) : null,
      createdAt: toUnixTime(table.createdAt),
      updatedAt: toUnixTime(table.updatedAt),
      columns: [],
      rows: [],
    }
  })

  return c.json(nodes)
})

/**
 * POST /tables - Create a new table
 */
export const POST = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      name: z.string(),
      order: z.number().optional(),
    }),
  ),
  async (c) => {
    const json = c.req.valid("json")

    const id = crypto.randomUUID()

    const maxOrder = await c.var.database.query.tables.findFirst({
      orderBy(tables, ops) {
        return ops.desc(tables.order)
      },
    })

    const order = json.order ?? (maxOrder?.order ?? 0) + 1

    await c.var.database.insert(tables).values({
      id: id,
      name: json.name,
      order: order,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const table = await c.var.database.query.tables.findFirst({
      where: eq(tables.id, id),
    })

    if (!table) {
      throw new HTTPException(404, { message: "Table not found" })
    }

    const node: AppSheet = {
      id: table.id,
      name: table.name,
      order: table.order,
      deletedAt: table.deletedAt ? toUnixTime(table.deletedAt) : null,
      createdAt: toUnixTime(table.createdAt),
      updatedAt: toUnixTime(table.updatedAt),
      columns: [],
      rows: [],
    }

    return c.json(node)
  },
)
