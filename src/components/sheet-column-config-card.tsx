import { useMutation } from "@tanstack/react-query"
import { PlusIcon, XIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { client } from "@/lib/client"
import { COLUMN_TYPE_LABELS, COLUMN_TYPES } from "@/lib/constants"
import type { AppColumn } from "@/types"

type Props = {
  column: AppColumn
  onChange(): void
}

/**
 * SheetColumnConfigCard
 */
export function SheetColumnConfigCard(props: Props) {
  const [name, setName] = useState(props.column.name)

  const [type, setType] = useState(props.column.type)

  const [options, setOptions] = useState<string[]>(() => {
    if (props.column.options) {
      return props.column.options.split(",").map((opt) => {
        return opt.trim()
      })
    }
    return []
  })

  const updateMutation = useMutation({
    async mutationFn(data: {
      columnId: string
      name: string
      type: string
      options: string | null
    }) {
      const response = await client.api.columns[":id"].$patch({
        param: {
          id: data.columnId,
        },
        json: {
          name: data.name,
          type: data.type,
          options: data.options,
        },
      })
      return response.json()
    },
    onSuccess() {
      props.onChange()
    },
  })

  const deleteMutation = useMutation({
    async mutationFn(data: { columnId: string }) {
      const response = await client.api.columns[":id"].$delete({
        param: {
          id: data.columnId,
        },
      })
      return response.json()
    },
    onSuccess() {
      props.onChange()
    },
  })

  const needsOptions =
    type === COLUMN_TYPES.TEXT_SELECT || type === COLUMN_TYPES.TEXT_MULTI_SELECT

  const onSave = () => {
    const optionsString = options.length > 0 ? options.join(", ") : null

    updateMutation.mutate({
      columnId: props.column.id,
      name: name,
      type: type,
      options: needsOptions ? optionsString : null,
    })
  }

  const onDelete = () => {
    if (confirm("Delete this column?")) {
      deleteMutation.mutate({
        columnId: props.column.id,
      })
    }
  }

  return (
    <Card className={"flex flex-col gap-2 rounded-2xl p-4 shadow-none"}>
      <div className={"text-sm"}>{props.column.id}</div>
      <div>
        <Input
          className={"rounded-full shadow-none"}
          value={name}
          onChange={(event) => {
            return setName(event.target.value)
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSave()
            }
          }}
        />
      </div>
      <div className={"flex flex-col justify-between gap-2 md:flex-row"}>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className={"rounded-full shadow-none"}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(COLUMN_TYPES).map(([_key, value]) => (
              <SelectItem key={value} value={value}>
                {COLUMN_TYPE_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Button
            className="flex-1 rounded-full"
            onClick={onSave}
            disabled={!name || updateMutation.isPending}
          >
            {"Save"}
          </Button>
          <Button
            className="flex-1 rounded-full"
            variant="secondary"
            onClick={onDelete}
            disabled={deleteMutation.isPending}
          >
            {"Delete"}
          </Button>
        </div>
      </div>
      {needsOptions && (
        <div className={"flex flex-col gap-2"}>
          <div className={"flex flex-wrap gap-2"}>
            {options.map((option, optionIndex) => (
              <InputGroup
                key={optionIndex.toFixed()}
                className={"w-fit rounded-full border shadow-none"}
              >
                <InputGroupInput
                  value={option}
                  onChange={(event) => {
                    const newOptions = [...options]
                    newOptions[optionIndex] = event.target.value
                    setOptions(newOptions)
                  }}
                />
                <InputGroupAddon>
                  <InputGroupButton
                    variant={"secondary"}
                    className={"rounded-full"}
                    onClick={() => {
                      const newOptions = options.filter((_value, index) => {
                        return index !== optionIndex
                      })
                      setOptions(newOptions)
                    }}
                  >
                    <XIcon />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            ))}
            <Button
              variant={"outline"}
              className={"rounded-full shadow-none"}
              onClick={() => {
                const newOptions = [
                  ...options,
                  crypto.randomUUID().split("-")[0],
                ]
                setOptions(newOptions)
              }}
            >
              <PlusIcon />
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
