import type { UseQueryResult } from "@tanstack/react-query"
import { useMutation, useQuery } from "@tanstack/react-query"
import { PlusIcon } from "lucide-react"
import { Suspense, use, useState } from "react"
import { HomeButton } from "@/components/home-button"
import { SheetConfigView } from "@/components/sheet-config-view"
import { Button } from "@/components/ui/button"
import { client } from "@/lib/client"
import type { AppSheet } from "@/types"

type Props = {
  query: UseQueryResult<AppSheet[]>
}

export function SheetListMainView(props: Props) {
  const tables = use(props.query.promise)

  const [sheetId, setSheetId] = useState<string | null>(
    tables.length > 0 ? tables[0].id : null,
  )

  const sheetQuery = useQuery({
    queryKey: ["tables", sheetId],
    enabled: sheetId !== null,
    async queryFn() {
      if (sheetId === null) {
        throw new Error("sheetId is null")
      }
      const resp = await client.api.tables[":id"].$get({
        param: { id: sheetId },
      })
      return resp.json()
    },
  })

  const addMutation = useMutation({
    async mutationFn(data: { name: string; order: number }) {
      const resp = await client.api.tables.$post({
        json: {
          name: data.name,
          order: data.order,
        },
      })
      return resp.json()
    },
    async onSuccess() {
      await props.query.refetch()
    },
  })

  const onAddTable = () => {
    addMutation.mutate({
      name: "new",
      order: tables.length,
    })
  }

  const onChange = () => {
    props.query.refetch()
  }

  return (
    <div className={"flex"}>
      <div
        className={
          "sticky top-0 flex h-screen min-w-40 flex-col border-primary border-r border-dashed"
        }
      >
        <div
          className={"relative flex items-start justify-start gap-2 px-4 py-4"}
        >
          <HomeButton isHome={false} />
          <div
            className={"absolute bottom-0 left-0 w-full border-b border-dashed"}
          />
        </div>
        <div className={"flex flex-col gap-y-2 p-4"}>
          {tables.map((table, _tableIndex) => (
            <Button
              key={table.id}
              className="justify-start rounded-full"
              variant={sheetId === table.id ? "default" : "secondary"}
              onClick={() => setSheetId(table.id)}
            >
              {table.name}
            </Button>
          ))}
          <Button
            onClick={onAddTable}
            disabled={addMutation.isPending}
            variant="secondary"
            className="w-full justify-start rounded-full"
          >
            <PlusIcon />
            {"New"}
          </Button>
        </div>
      </div>
      <div className="flex-1">
        {sheetId !== null && (
          <Suspense fallback={<div className="p-4">Loading...</div>}>
            <SheetConfigView
              key={sheetId}
              query={sheetQuery}
              onChange={onChange}
            />
          </Suspense>
        )}
      </div>
    </div>
  )
}
