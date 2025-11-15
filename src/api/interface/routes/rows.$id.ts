import { zValidator } from "@hono/zod-validator"
import { eq } from "drizzle-orm"
import { HTTPException } from "hono/http-exception"
import { z } from "zod"
import { factory } from "@/api/interface/factory"
import { rows } from "@/schema"
import type { AppRow } from "@/types"
import { toUnixTime } from "@/utils/to-unix-time"

/**
 * PATCH /rows/:id - Update row
 */
export const PATCH = factory.createHandlers(
  zValidator("param", z.object({ id: z.string() })),
  zValidator(
    "json",
    z.object({
      order: z.number().optional(),
    }),
  ),
  async (c) => {
    const param = c.req.valid("param")

    const json = c.req.valid("json")

    await c.var.database
      .update(rows)
      .set({
        order: json.order,
        updatedAt: new Date(),
      })
      .where(eq(rows.id, param.id))

    const row = await c.var.database.query.rows.findFirst({
      where: eq(rows.id, param.id),
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

/**
 * DELETE /rows/:id - Delete row
 */
export const DELETE = factory.createHandlers(async (c) => {
  const param = c.req.valid("param")

  await c.var.database
    .update(rows)
    .set({
      deletedAt: new Date(),
    })
    .where(eq(rows.id, param.id))

  return c.json({ success: true })
})
