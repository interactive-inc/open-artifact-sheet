import { type UseQueryResult, useQuery } from "@tanstack/react-query"
import { Suspense, use } from "react"
import { HomeButton } from "@/components/home-button"
import { SheetTableView } from "@/components/sheet-table-view"
import { Button } from "@/components/ui/button"
import { client } from "@/lib/client"
import type { AppSheet } from "@/types"

type Props = {
  tablesQuery: UseQueryResult<AppSheet[]>
  selectedTableId: string | null
  onSelectTable: (tableId: string | null) => void
}

export function HomeMainView(props: Props) {
  const tables = use(props.tablesQuery.promise)

  const sheetId =
    props.selectedTableId || (tables.length > 0 ? tables[0].id : null)

  const query = useQuery({
    enabled: sheetId !== null,
    queryKey: ["table", sheetId],
    async queryFn() {
      if (sheetId === null) {
        throw new Error("No active table ID")
      }
      const response = await client.api.tables[":id"].$get({
        param: { id: sheetId },
      })
      return response.json()
    },
  })

  if (tables.length === 0) {
    return (
      <>
        <nav className="bg-background">
          <div className="mx-auto flex items-center gap-2 py-4 pr-4 pl-4">
            <HomeButton isHome={true} />
          </div>
        </nav>
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">
            No tables found. Create tables in the Tables page.
          </p>
        </div>
      </>
    )
  }

  const sheet = tables.find((table) => {
    return table.id === sheetId
  })

  return (
    <>
      <nav>
        <div className="mx-auto flex items-center gap-2 py-4 pr-4 pl-4">
          <HomeButton isHome={true} />
          <div className="flex items-center gap-2">
            {tables.map((table) => (
              <Button
                className="rounded-full"
                key={table.id}
                variant={table.id === sheetId ? "default" : "secondary"}
                size="sm"
                onClick={() => {
                  return props.onSelectTable(table.id)
                }}
              >
                {table.name}
              </Button>
            ))}
          </div>
        </div>
      </nav>
      {sheet && (
        <Suspense fallback={<div>{"Loading table..."}</div>}>
          <SheetTableView query={query} />
        </Suspense>
      )}
    </>
  )
}
