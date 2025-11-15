import type { DrizzleD1Database } from "drizzle-orm/d1"
import type { schema } from "@/lib/schema"

export type Bindings = Env

export type Variables = {
  database: DrizzleD1Database<typeof schema>
}

/**
 * Hono Context
 * @example new Hono<Env>()
 */
export type HonoEnv = {
  Bindings: Bindings
  Variables: Variables
}

/**
 * Context Storage
 * https://hono.dev/docs/middleware/builtin/context-storage#context-storage-middleware
 */
export type Context = {
  var: Variables
  env: Bindings
}
