import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Suspense, useState } from "react"
import { HomeMainView } from "@/components/home-main-view"
import { client } from "@/lib/client"

export const Route = createFileRoute("/")({
  component: Component,
})

export function Component() {
  const tablesQuery = useQuery({
    queryKey: ["tables"],
    async queryFn() {
      const response = await client.api.tables.$get()
      return response.json()
    },
  })

  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeMainView
        tablesQuery={tablesQuery}
        selectedTableId={selectedTableId}
        onSelectTable={setSelectedTableId}
      />
    </Suspense>
  )
}
