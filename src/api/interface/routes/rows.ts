import { zValidator } from "@hono/zod-validator"
import { eq } from "drizzle-orm"
import { HTTPException } from "hono/http-exception"
import { z } from "zod"
import { factory } from "@/api/interface/factory"
import { rows } from "@/schema"
import type { AppRow } from "@/types"
import { toUnixTime } from "@/utils/to-unix-time"

/**
 * POST /rows - Create a new row
 */
export const POST = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      tableId: z.string(),
      order: z.number(),
    }),
  ),
  async (c) => {
    const json = c.req.valid("json")

    const id = crypto.randomUUID()

    await c.var.database.insert(rows).values({
      id: id,
      tableId: json.tableId,
      order: json.order,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const row = await c.var.database.query.rows.findFirst({
      where: eq(rows.id, id),
    })

    if (!row) {
      throw new HTTPException(404, { message: "Row not found" })
    }

    const node: AppRow = {
      id: row.id,
      tableId: row.tableId,
      order: row.order,
      deletedAt: row.deletedAt ? toUnixTime(row.deletedAt) : null,
      createdAt: toUnixTime(row.createdAt),
      updatedAt: toUnixTime(row.updatedAt),
      cells: [],
    }

    return c.json(node)
  },
)
