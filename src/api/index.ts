import { contextStorage } from "hono/context-storage"
import { cors } from "hono/cors"
import { HTTPException } from "hono/http-exception"
import { factory } from "@/api/interface/factory"
import { databaseMiddleware } from "@/api/interface/middlewares/database-middleware"
import * as cells from "@/api/interface/routes/cells"
import * as columns from "@/api/interface/routes/columns"
import * as columns_$id from "@/api/interface/routes/columns.$id"
import * as index from "@/api/interface/routes/index"
import * as rows from "@/api/interface/routes/rows"
import * as rows_$id from "@/api/interface/routes/rows.$id"
import * as tables from "@/api/interface/routes/tables"
import * as tables_$id from "@/api/interface/routes/tables.$id"

export const app = factory
  .createApp()
  .use(cors({ credentials: true, origin: (v) => v }))
  .use(contextStorage())
  .use(databaseMiddleware)
  .basePath("/api")
  .get("/", ...index.GET)
  .get("/tables", ...tables.GET)
  .post("/tables", ...tables.POST)
  .get("/tables/:id", ...tables_$id.GET)
  .patch("/tables/:id", ...tables_$id.PATCH)
  .delete("/tables/:id", ...tables_$id.DELETE)
  .post("/columns", ...columns.POST)
  .patch("/columns/:id", ...columns_$id.PATCH)
  .delete("/columns/:id", ...columns_$id.DELETE)
  .post("/rows", ...rows.POST)
  .patch("/rows/:id", ...rows_$id.PATCH)
  .delete("/rows/:id", ...rows_$id.DELETE)
  .post("/cells", ...cells.POST)

app.onError((e, c) => {
  console.error(e)

  if (e instanceof HTTPException) {
    return c.json({ message: e.message }, { status: e.status })
  }

  return c.json({ message: e.message }, { status: 500 })
})
