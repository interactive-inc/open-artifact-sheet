import { relations } from "drizzle-orm"
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core"

export const tables = sqliteTable("tables", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  order: integer("order").notNull().default(0),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
})

export const tablesRelations = relations(tables, (helpers) => {
  return {
    columns: helpers.many(columns),
    rows: helpers.many(rows),
  }
})

export const columns = sqliteTable("columns", {
  id: text("id").primaryKey(),
  tableId: text("table_id")
    .notNull()
    .references(() => {
      return tables.id
    }),
  name: text("name").notNull(),
  type: text("type").notNull().default("text"),
  order: integer("order").notNull(),
  options: text("options"),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
})

export const columnsRelations = relations(columns, (helpers) => {
  return {
    table: helpers.one(tables, {
      fields: [columns.tableId],
      references: [tables.id],
    }),
    cells: helpers.many(cells),
  }
})

export const rows = sqliteTable("rows", {
  id: text("id").primaryKey(),
  tableId: text("table_id")
    .notNull()
    .references(() => {
      return tables.id
    }),
  order: integer("order").notNull(),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
})

export const rowsRelations = relations(rows, (helpers) => {
  return {
    table: helpers.one(tables, {
      fields: [rows.tableId],
      references: [tables.id],
    }),
    cells: helpers.many(cells),
  }
})

export const cells = sqliteTable(
  "cells",
  {
    id: text("id").primaryKey(),
    rowId: text("row_id")
      .notNull()
      .references(() => {
        return rows.id
      }),
    columnId: text("column_id")
      .notNull()
      .references(() => {
        return columns.id
      }),
    value: text("value"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => {
    return [unique().on(table.rowId, table.columnId)]
  },
)

export const cellsRelations = relations(cells, (helpers) => {
  return {
    row: helpers.one(rows, {
      fields: [cells.rowId],
      references: [rows.id],
    }),
    column: helpers.one(columns, {
      fields: [cells.columnId],
      references: [columns.id],
    }),
  }
})
