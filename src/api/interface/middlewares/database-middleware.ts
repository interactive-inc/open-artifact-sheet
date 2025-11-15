import { drizzle } from "drizzle-orm/d1"
import { factory } from "@/api/interface/factory"
import { schema } from "@/lib/schema"

/**
 * Set Drizzle Client to c.var.database
 */
export const databaseMiddleware = factory.createMiddleware((c, next) => {
  const client = drizzle(c.env.DB, { schema })

  c.set("database", client)

  return next()
})
