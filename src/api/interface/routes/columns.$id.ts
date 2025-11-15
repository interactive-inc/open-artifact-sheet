import { zValidator } from "@hono/zod-validator"
import { eq } from "drizzle-orm"
import { HTTPException } from "hono/http-exception"
import { z } from "zod"
import { factory } from "@/api/interface/factory"
import { columns } from "@/schema"
import type { AppColumn } from "@/types"
import { toUnixTime } from "@/utils/to-unix-time"

/**
 * PATCH /columns/:id - Update column
 */
export const PATCH = factory.createHandlers(
  zValidator("param", z.object({ id: z.string() })),
  zValidator(
    "json",
    z.object({
      name: z.string().optional(),
      type: z.string().optional(),
      order: z.number().optional(),
    }),
  ),
  async (c) => {
    const param = c.req.valid("param")

    const json = c.req.valid("json")

    await c.var.database
      .update(columns)
      .set({
        name: json.name,
        type: json.type,
        order: json.order,
        updatedAt: new Date(),
      })
      .where(eq(columns.id, param.id))

    const column = await c.var.database.query.columns.findFirst({
      where: eq(columns.id, param.id),
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
      deletedAt: column.deletedAt ? toUnixTime(column.deletedAt) : null,
      createdAt: toUnixTime(column.createdAt),
      updatedAt: toUnixTime(column.updatedAt),
    }

    return c.json(node)
  },
)

/**
 * DELETE /columns/:id - Delete column
 */
export const DELETE = factory.createHandlers(
  zValidator("param", z.object({ id: z.string() })),
  async (c) => {
    const param = c.req.valid("param")

    await c.var.database
      .update(columns)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(columns.id, param.id))

    return c.json({ success: true })
  },
)
