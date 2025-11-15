import type { UseQueryResult } from "@tanstack/react-query"
import { useMutation } from "@tanstack/react-query"
import { PlusIcon } from "lucide-react"
import { use, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { client } from "@/lib/client"
import type { AppSheet } from "@/types"

type Props = {
  query: UseQueryResult<AppSheet>
  onChange(): void
}

export function SheetConfigView(props: Props) {
  const sheet = use(props.query.promise)

  const [tableName, setTableName] = useState(sheet.name)

  const [columnNames, setColumnNames] = useState<Record<string, string>>(
    Object.fromEntries(
      sheet.columns.map((col) => {
        return [col.id, col.name]
      }),
    ),
  )

  const updateTableMutation = useMutation({
    async mutationFn(data: { tableId: string; name: string }) {
      const response = await client.api.tables[":id"].$patch({
        param: {
          id: data.tableId,
        },
        json: {
          name: data.name,
        },
      })
      return response.json()
    },
    async onSuccess() {
      await props.query.refetch()
      props.onChange()
    },
  })

  const deleteTableMutation = useMutation({
    async mutationFn(data: { tableId: string }) {
      const response = await client.api.tables[":id"].$delete({
        param: {
          id: data.tableId,
        },
      })
      return response.json()
    },
    async onSuccess() {
      await props.query.refetch()
      props.onChange()
    },
  })

  const updateColumnMutation = useMutation({
    async mutationFn(data: { columnId: string; name: string }) {
      const response = await client.api.columns[":id"].$patch({
        param: {
          id: data.columnId,
        },
        json: {
          name: data.name,
        },
      })
      return response.json()
    },
    async onSuccess() {
      await props.query.refetch()
      props.onChange()
    },
  })

  const deleteColumnMutation = useMutation({
    async mutationFn(data: { columnId: string }) {
      const response = await client.api.columns[":id"].$delete({
        param: {
          id: data.columnId,
        },
      })
      return response.json()
    },
    async onSuccess() {
      await props.query.refetch()
      props.onChange()
    },
  })

  const addColumnMutation = useMutation({
    async mutationFn(data: { tableId: string; name: string; order: number }) {
      const response = await client.api.columns.$post({
        json: {
          tableId: data.tableId,
          name: data.name,
          type: "text",
          order: data.order,
        },
      })
      return response.json()
    },
    async onSuccess() {
      await props.query.refetch()
    },
  })

  const onSaveTable = () => {
    updateTableMutation.mutate({
      tableId: sheet.id,
      name: tableName,
    })
  }

  const onDeleteTable = () => {
    if (confirm("Delete this table?")) {
      deleteTableMutation.mutate({
        tableId: sheet.id,
      })
    }
  }

  const onSaveColumn = (columnId: string) => {
    updateColumnMutation.mutate({
      columnId: columnId,
      name: columnNames[columnId],
    })
  }

  const onDeleteColumn = (columnId: string) => {
    if (confirm("Delete this column?")) {
      deleteColumnMutation.mutate({
        columnId: columnId,
      })
    }
  }

  const onAddColumn = () => {
    addColumnMutation.mutate({
      tableId: sheet.id,
      name: "new",
      order: sheet.columns.length,
    })
  }

  return (
    <div className="flex flex-col gap-y-4 p-4">
      <div className={"flex flex-col gap-y-2"}>
        <h2 className={"font-bold"}>{"Sheet Name"}</h2>
        <div className={"flex items-center gap-2"}>
          <Input
            className={"flex-1 rounded-full shadow-none"}
            value={tableName}
            onChange={(event) => {
              return setTableName(event.target.value)
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onSaveTable()
              }
            }}
          />
          <Button
            className={"rounded-full"}
            onClick={onSaveTable}
            disabled={!tableName || updateTableMutation.isPending}
          >
            {"Save"}
          </Button>
        </div>
      </div>
      <div className={"flex flex-col gap-y-2"}>
        <h2 className="font-bold">Columns</h2>
        <div className="space-y-2">
          {sheet.columns.map((column) => (
            <Card
              key={column.id}
              className={"flex flex-col gap-2 rounded-2xl p-4 shadow-none"}
            >
              <div className={"text-sm"}>{column.id}</div>
              <div className={"flex items-center gap-2"}>
                <Input
                  className={"flex-1 rounded-full shadow-none"}
                  value={columnNames[column.id]}
                  onChange={(event) => {
                    setColumnNames({
                      ...columnNames,
                      [column.id]: event.target.value,
                    })
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      onSaveColumn(column.id)
                    }
                  }}
                />
                <Button
                  className="rounded-full"
                  size="sm"
                  onClick={() => {
                    return onSaveColumn(column.id)
                  }}
                  disabled={
                    !columnNames[column.id] || updateColumnMutation.isPending
                  }
                >
                  {"Save"}
                </Button>
                <Button
                  className="rounded-full"
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    return onDeleteColumn(column.id)
                  }}
                  disabled={deleteColumnMutation.isPending}
                >
                  {"Delete"}
                </Button>
              </div>
            </Card>
          ))}
          <Button
            className={"w-full rounded-full shadow-none"}
            variant={"secondary"}
            disabled={addColumnMutation.isPending}
            onClick={onAddColumn}
          >
            <PlusIcon />
            {"New Column"}
          </Button>
        </div>
      </div>
      <Card className={"gap-y-4 rounded-2xl p-4 shadow-none"}>
        <div>
          <h2 className={"font-bold text-destructive"}>
            {"Dangerous Operation"}
          </h2>
          <p className="text-muted-foreground text-sm">
            {
              "This table and all data will be deleted. This action cannot be undone."
            }
          </p>
        </div>
        <Button
          className={"rounded-full"}
          variant={"destructive"}
          onClick={onDeleteTable}
          disabled={deleteTableMutation.isPending}
        >
          {"Delete Table"}
        </Button>
      </Card>
    </div>
  )
}
