import type { UseQueryResult } from "@tanstack/react-query"
import { useMutation } from "@tanstack/react-query"
import { XIcon } from "lucide-react"
import { SheetCellInput } from "@/components/sheet-cell-input"
import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import { client } from "@/lib/client"
import { cn } from "@/lib/utils"
import type { AppColumn, AppRow, AppSheet } from "@/types"

type Props = {
  row: AppRow
  rowIndex: number
  columns: AppColumn[]
  query: UseQueryResult<AppSheet>
}

/**
 * SheetRow
 */
export function SheetRow(props: Props) {
  const deleteRowMutation = useMutation({
    async mutationFn(data: { rowId: string }) {
      const response = await client.api.rows[":id"].$delete({
        param: {
          id: data.rowId,
        },
      })
      return response.json()
    },
    async onSuccess() {
      await props.query.refetch()
    },
  })

  const onDeleteRow = () => {
    const hasContent =
      props.row.cells?.some((cell) => {
        return cell.value !== null && cell.value !== ""
      }) ?? false

    if (hasContent && !confirm("Delete this row?")) {
      return
    }

    deleteRowMutation.mutate({
      rowId: props.row.id,
    })
  }

  return (
    <TableRow key={props.row.id} className={"border-dashed"}>
      <TableCell className={"pr-1 pl-4 align-top"}>
        <Button
          size={"sm"}
          variant={"outline"}
          className={"rounded-full border-dashed shadow-none"}
          onClick={onDeleteRow}
          disabled={deleteRowMutation.isPending}
        >
          <XIcon className={"size-4"} />
          {props.row.id.split("-")[0]}
        </Button>
      </TableCell>
      {props.columns.map((column, columnIndex) => {
        const cell = props.row.cells.find((cellItem) => {
          return cellItem.columnId === column.id
        })
        return (
          <TableCell
            key={`${props.row.id}:${column.id}`}
            className={cn("min-w-40 px-1 align-top", {
              "pr-4": columnIndex === props.columns.length - 1,
            })}
          >
            <SheetCellInput
              column={column}
              rowId={props.row.id}
              columnId={column.id}
              value={cell ?? null}
              query={props.query}
            />
          </TableCell>
        )
      })}
    </TableRow>
  )
}
