import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Suspense } from "react"
import { SheetListMainView } from "@/components/sheet-list-main-view"
import { client } from "@/lib/client"

export const Route = createFileRoute("/tables/")({
  component: Component,
})

/**
 * TableManagementPage
 */
export function Component() {
  const query = useQuery({
    queryKey: ["tables"],
    async queryFn() {
      const response = await client.api.tables.$get()
      return response.json()
    },
  })

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SheetListMainView query={query} />
    </Suspense>
  )
}
