import { zValidator } from "@hono/zod-validator"
import { asc, eq } from "drizzle-orm"
import { HTTPException } from "hono/http-exception"
import { z } from "zod"
import { factory } from "@/api/interface/factory"
import { schema } from "@/lib/schema"
import type { AppSheet } from "@/types"
import { toUnixTime } from "@/utils/to-unix-time"

/**
 * GET /tables/:id - Get table with columns and rows
 */
export const GET = factory.createHandlers(
  zValidator("param", z.object({ id: z.string() })),
  async (c) => {
    const param = c.req.valid("param")

    const table = await c.var.database.query.tables.findFirst({
      where: eq(schema.tables.id, param.id),
      with: {
        rows: { with: { cells: true } },
        columns: {
          where(column, o) {
            return o.isNull(column.deletedAt)
          },
        },
      },
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
      columns: table.columns.map((column) => {
        return {
          id: column.id,
          tableId: column.tableId,
          name: column.name,
          type: column.type.toUpperCase(),
          order: column.order,
          deletedAt: column.deletedAt ? toUnixTime(column.deletedAt) : null,
          createdAt: toUnixTime(column.createdAt),
          updatedAt: toUnixTime(column.updatedAt),
        }
      }),
      rows: table.rows.map((row) => {
        return {
          id: row.id,
          tableId: row.tableId,
          order: row.order,
          deletedAt: row.deletedAt ? toUnixTime(row.deletedAt) : null,
          createdAt: toUnixTime(row.createdAt),
          updatedAt: toUnixTime(row.updatedAt),
          cells: row.cells.map((cell) => {
            return {
              id: cell.id,
              rowId: cell.rowId,
              columnId: cell.columnId,
              value: cell.value,
              createdAt: toUnixTime(cell.createdAt),
              updatedAt: toUnixTime(cell.updatedAt),
            }
          }),
        }
      }),
    }

    return c.json(node)
  },
)

/**
 * PATCH /tables/:id - Update table
 */
export const PATCH = factory.createHandlers(
  zValidator("param", z.object({ id: z.string() })),
  zValidator("json", z.object({ name: z.string().optional() })),
  async (c) => {
    const param = c.req.valid("param")

    const json = c.req.valid("json")

    await c.var.database
      .update(schema.tables)
      .set({
        name: json.name,
        updatedAt: new Date(),
      })
      .where(eq(schema.tables.id, param.id))

    const result = await c.var.database.query.tables.findFirst({
      where: eq(schema.tables.id, param.id),
    })

    if (!result) {
      throw new HTTPException(404, { message: "Table not found" })
    }

    const table = await c.var.database.query.tables.findFirst({
      where: eq(schema.tables.id, param.id),
      with: {
        columns: {
          orderBy: asc(schema.tables.order),
        },
        rows: {
          orderBy: asc(schema.rows.order),
          with: { cells: true },
        },
      },
    })

    if (table === undefined) {
      throw new HTTPException(404, { message: "Table not found" })
    }

    const node: AppSheet = {
      id: table.id,
      name: table.name,
      order: table.order,
      deletedAt: table.deletedAt ? toUnixTime(table.deletedAt) : null,
      createdAt: toUnixTime(table.createdAt),
      updatedAt: toUnixTime(table.updatedAt),
      columns: table.columns.map((column) => {
        return {
          id: column.id,
          tableId: column.tableId,
          name: column.name,
          type: column.type,
          order: column.order,
          deletedAt: column.deletedAt ? toUnixTime(column.deletedAt) : null,
          createdAt: toUnixTime(column.createdAt),
          updatedAt: toUnixTime(column.updatedAt),
        }
      }),
      rows: table.rows.map((row) => {
        return {
          id: row.id,
          tableId: row.tableId,
          order: row.order,
          deletedAt: row.deletedAt ? toUnixTime(row.deletedAt) : null,
          createdAt: toUnixTime(row.createdAt),
          updatedAt: toUnixTime(row.updatedAt),
          cells: row.cells.map((cell) => {
            return {
              id: cell.id,
              rowId: cell.rowId,
              columnId: cell.columnId,
              value: cell.value,
              createdAt: toUnixTime(cell.createdAt),
              updatedAt: toUnixTime(cell.updatedAt),
            }
          }),
        }
      }),
    }

    return c.json(node)
  },
)

/**
 * DELETE /tables/:id - Delete table
 */
export const DELETE = factory.createHandlers(
  zValidator("param", z.object({ id: z.string() })),
  async (c) => {
    const param = c.req.valid("param")

    await c.var.database
      .update(schema.tables)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(schema.tables.id, param.id))

    return c.json({ success: true })
  },
)
