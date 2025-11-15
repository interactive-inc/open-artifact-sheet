import { readdirSync } from "node:fs"
import { defineConfig } from "drizzle-kit"

const fileNames = readdirSync(
  ".wrangler/state/v3/d1/miniflare-D1DatabaseObject",
)

const fileName = fileNames.find((fileName) => {
  return fileName.endsWith(".sqlite")
})

if (fileName === undefined) {
  throw new Error("No sqlite file found")
}

export default defineConfig({
  out: "drizzle",
  schema: "src/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: `.wrangler/state/v3/d1/miniflare-D1DatabaseObject/${fileName}`,
  },
})
