import { cn } from "@/lib/utils"

export function CustomTableRow({
  className,
  ...props
}: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "transition-colors data-[state=selected]:bg-muted",
        className,
      )}
      {...props}
    />
  )
}
