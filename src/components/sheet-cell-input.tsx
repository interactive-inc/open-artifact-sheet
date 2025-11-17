import type { UseQueryResult } from "@tanstack/react-query"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { client } from "@/lib/client"
import { COLUMN_TYPES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { AppCell, AppColumn } from "@/types"

type Props = {
  column: AppColumn
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

  const onBooleanChange = (checked: boolean) => {
    const newValue = checked ? "TRUE" : "FALSE"
    setValue(newValue)
    mutation.mutate({
      rowId: props.rowId,
      columnId: props.columnId,
      value: newValue,
    })
  }

  if (props.column.type === COLUMN_TYPES.TEXT_MULTI_LINE) {
    return (
      <Textarea
        className={cn(
          "field-sizing-content w-full rounded-2xl border-dashed shadow-none",
          { "border-primary": value.length !== 0 },
        )}
        value={value}
        onBlur={onSave}
        onChange={(event) => {
          return setValue(event.target.value)
        }}
      />
    )
  }

  if (props.column.type === COLUMN_TYPES.TEXT_URL) {
    return (
      <Input
        type="url"
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

  if (props.column.type === COLUMN_TYPES.DATE) {
    return (
      <Input
        type="date"
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

  if (props.column.type === COLUMN_TYPES.DATE_TIME) {
    return (
      <Input
        type="datetime-local"
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

  if (props.column.type === COLUMN_TYPES.NUMBER) {
    return (
      <Input
        type="number"
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

  if (props.column.type === COLUMN_TYPES.BOOLEAN) {
    return (
      <div className="flex items-center justify-center p-2">
        <Checkbox
          checked={value === "TRUE"}
          onCheckedChange={onBooleanChange}
        />
      </div>
    )
  }

  if (props.column.type === COLUMN_TYPES.TEXT_SELECT) {
    const options = props.column.options
      ? props.column.options.split(",").map((opt) => {
          return opt.trim()
        })
      : []

    if (options.length === 0) {
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
          placeholder="No options defined..."
        />
      )
    }

    return (
      <Select
        value={value}
        onValueChange={(newValue) => {
          const finalValue = newValue === "__empty__" ? "" : newValue
          setValue(finalValue)
          mutation.mutate({
            rowId: props.rowId,
            columnId: props.columnId,
            value: finalValue || null,
          })
        }}
      >
        <SelectTrigger
          className={cn("rounded-full border-dashed shadow-none", {
            "border-primary": value.length !== 0,
          })}
        >
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__empty__">{"(なし)"}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  if (props.column.type === COLUMN_TYPES.TEXT_MULTI_SELECT) {
    const options = props.column.options
      ? props.column.options.split(",").map((opt) => {
          return opt.trim()
        })
      : []

    const selectedValues = value
      ? value.split(",").map((v) => {
          return v.trim()
        })
      : []

    const availableOptions = options.filter((opt) => {
      return !selectedValues.includes(opt)
    })

    const addOption = (option: string) => {
      const newValues = [...selectedValues, option]
      const newValue = newValues.join(", ")
      setValue(newValue)
      mutation.mutate({
        rowId: props.rowId,
        columnId: props.columnId,
        value: newValue || null,
      })
    }

    const removeOption = (option: string) => {
      const newValues = selectedValues.filter((v) => {
        return v !== option
      })
      const newValue = newValues.length > 0 ? newValues.join(", ") : ""
      setValue(newValue)
      mutation.mutate({
        rowId: props.rowId,
        columnId: props.columnId,
        value: newValue || null,
      })
    }

    if (options.length === 0) {
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
          placeholder="No options defined..."
        />
      )
    }

    return (
      <div className="flex flex-row gap-2">
        {selectedValues.length > 0 && (
          <div className="flex gap-1">
            {selectedValues.map((selectedValue) => (
              <Button
                key={selectedValue}
                variant="secondary"
                size="sm"
                className="rounded-full text-xs"
                onClick={() => {
                  return removeOption(selectedValue)
                }}
              >
                {selectedValue}
                <span className="ml-1">×</span>
              </Button>
            ))}
          </div>
        )}
        {availableOptions.length > 0 && (
          <Select
            value=""
            onValueChange={(newValue) => {
              if (newValue) {
                addOption(newValue)
              }
            }}
          >
            <SelectTrigger
              size="sm"
              className={cn("rounded-full border-dashed shadow-none", {
                "border-primary": selectedValues.length > 0,
              })}
            >
              <SelectValue placeholder="Add" />
            </SelectTrigger>
            <SelectContent>
              {availableOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    )
  }

  return (
    <Input
      className={cn(
        "field-sizing-content rounded-full border-dashed shadow-none",
        {
          "border-primary": value.length !== 0,
        },
      )}
      value={value}
      onBlur={onSave}
      onChange={(event) => {
        return setValue(event.target.value)
      }}
    />
  )
}
