import { zValidator } from "@hono/zod-validator"
import { and, eq } from "drizzle-orm"
import { HTTPException } from "hono/http-exception"
import { z } from "zod"
import { factory } from "@/api/interface/factory"
import { cells } from "@/schema"
import type { AppCell } from "@/types"
import { toUnixTime } from "@/utils/to-unix-time"

/**
 * POST /cells - Create or update a cell
 */
export const POST = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      rowId: z.string(),
      columnId: z.string(),
      value: z.string().nullable(),
    }),
  ),
  async (c) => {
    const json = c.req.valid("json")

    const existingCell = await c.var.database.query.cells.findFirst({
      where: and(
        eq(cells.rowId, json.rowId),
        eq(cells.columnId, json.columnId),
      ),
    })

    if (existingCell) {
      await c.var.database
        .update(cells)
        .set({
          value: json.value,
          updatedAt: new Date(),
        })
        .where(eq(cells.id, existingCell.id))

      const cell = await c.var.database.query.cells.findFirst({
        where: eq(cells.id, existingCell.id),
      })

      return c.json(cell)
    }

    const id = crypto.randomUUID()

    await c.var.database.insert(cells).values({
      id: id,
      rowId: json.rowId,
      columnId: json.columnId,
      value: json.value,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const cell = await c.var.database.query.cells.findFirst({
      where: eq(cells.id, id),
    })

    if (!cell) {
      throw new HTTPException(404, { message: "Cell not found" })
    }

    const node: AppCell = {
      id: cell.id,
      rowId: cell.rowId,
      columnId: cell.columnId,
      value: cell.value,
      createdAt: toUnixTime(cell.createdAt),
      updatedAt: toUnixTime(cell.updatedAt),
    }

    return c.json(node)
  },
)
