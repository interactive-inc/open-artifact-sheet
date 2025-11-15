import type { UseQueryResult } from "@tanstack/react-query"
import { useMutation } from "@tanstack/react-query"
import { PlusIcon } from "lucide-react"
import { use } from "react"
import { SheetRow } from "@/components/sheet-row"
import { Button } from "@/components/ui/button"
import { TableBody, TableCell, TableHead } from "@/components/ui/table"
import { CustomTableRow } from "@/components/ui-custom/custom-table-row"
import { client } from "@/lib/client"
import { env } from "@/lib/env"
import { cn } from "@/lib/utils"
import type { AppSheet } from "@/types"

type Props = {
  query: UseQueryResult<AppSheet>
}

/**
 * SpreadsheetTable
 */
export function SheetTableView(props: Props) {
  const table = use(props.query.promise)

  const addRowMutation = useMutation({
    async mutationFn(data: { tableId: string; order: number }) {
      const response = await client.api.rows.$post({
        json: {
          tableId: data.tableId,
          order: data.order,
        },
      })
      return response.json()
    },
    async onSuccess() {
      await props.query.refetch()
    },
  })

  const handleAddRow = () => {
    addRowMutation.mutate({
      tableId: table.id,
      order: table.rows.length,
    })
  }

  return (
    <div
      className="overflow-x-auto"
      style={{ height: `calc(100svh - ${env.headerHeight}px)` }}
    >
      <table data-slot="table" className={"w-full caption-bottom text-sm"}>
        <thead
          data-slot="table-header"
          className="sticky top-0 z-40 bg-background"
        >
          <tr className="absolute bottom-0 left-0 w-full border-primary border-b border-dashed" />
          <CustomTableRow>
            <TableHead className="pl-4">{"ID"}</TableHead>
            {table.columns.map((column, columnIndex) => (
              <TableHead
                key={column.id}
                className={cn("text-primary", {
                  "pr-4": columnIndex === table.columns.length - 1,
                })}
              >
                {column.name}
              </TableHead>
            ))}
          </CustomTableRow>
        </thead>
        <TableBody>
          {table.rows.map((row, rowIndex) => (
            <SheetRow
              key={row.id}
              row={row}
              rowIndex={rowIndex}
              columns={table.columns}
              query={props.query}
            />
          ))}
          <tr data-slot="table-row">
            <TableCell colSpan={table.columns.length + 1} className="py-4 pl-4">
              <div className="flex">
                <Button
                  variant="outline"
                  className={"rounded-full border-dashed shadow-none"}
                  onClick={handleAddRow}
                  disabled={addRowMutation.isPending}
                >
                  <PlusIcon className="h-4 w-4" />
                  {"Add Row"}
                </Button>
              </div>
            </TableCell>
          </tr>
        </TableBody>
      </table>
    </div>
  )
}
