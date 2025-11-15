import { zValidator } from "@hono/zod-validator"
import { eq } from "drizzle-orm"
import { HTTPException } from "hono/http-exception"
import { z } from "zod"
import { factory } from "@/api/interface/factory"
import { columns } from "@/schema"
import type { AppColumn } from "@/types"
import { toUnixTime } from "@/utils/to-unix-time"

/**
 * POST /columns - Create a new column
 */
export const POST = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      tableId: z.string(),
      name: z.string(),
      type: z.string().default("text"),
      order: z.number(),
      options: z.string().nullable().optional(),
    }),
  ),
  async (c) => {
    const json = c.req.valid("json")

    const id = crypto.randomUUID()

    await c.var.database.insert(columns).values({
      id: id,
      tableId: json.tableId,
      name: json.name,
      type: json.type,
      order: json.order,
      options: json.options,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const column = await c.var.database.query.columns.findFirst({
      where: eq(columns.id, id),
    })

    if (!column) {
      throw new HTTPException(404, { message: "Column not found" })
    }

    const node: AppColumn = {
      id: column.id,
      tableId: column.tableId,
      name: column.name,
      type: column.type,
      order: column.order,
      options: column.options,
      deletedAt: column.deletedAt ? toUnixTime(column.deletedAt) : null,
      createdAt: toUnixTime(column.createdAt),
      updatedAt: toUnixTime(column.updatedAt),
    }

    return c.json(node)
  },
)
