import type { UseQueryResult } from "@tanstack/react-query"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { client } from "@/lib/client"
import { cn } from "@/lib/utils"
import type { AppCell } from "@/types"

type Props = {
  type: string
  rowId: string
  columnId: string
  value: AppCell | null
  query: UseQueryResult
}

/**
 * EditableCell
 */
export function SheetCellInput(props: Props) {
  const [value, setValue] = useState(props.value?.value || "")

  const mutation = useMutation({
    async mutationFn(data: {
      rowId: string
      columnId: string
      value: string | null
    }) {
      const response = await client.api.cells.$post({
        json: data,
      })
      return response.json()
    },
    async onSuccess() {
      await props.query.refetch()
    },
  })

  const onSave = () => {
    mutation.mutate({
      rowId: props.rowId,
      columnId: props.columnId,
      value: value || null,
    })
  }

  if (props.type === "TEXT") {
    return (
      <Textarea
        className={cn("rounded-2xl border-dashed shadow-none", {
          "border-primary": value.length !== 0,
        })}
        value={value}
        onBlur={onSave}
        onChange={(event) => {
          return setValue(event.target.value)
        }}
      />
    )
  }

  return (
    <Input
      className={cn("rounded-full border-dashed shadow-none", {
        "border-primary": value.length !== 0,
      })}
      value={value}
      onBlur={onSave}
      onChange={(event) => {
        return setValue(event.target.value)
      }}
    />
  )
}
