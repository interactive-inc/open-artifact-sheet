export type AppCell = {
  id: string
  rowId: string
  columnId: string
  value: string | null
  createdAt: number
  updatedAt: number
}

export type AppRow = {
  id: string
  tableId: string
  order: number
  deletedAt: number | null
  createdAt: number
  updatedAt: number
  cells: AppCell[]
}

export type AppColumn = {
  id: string
  tableId: string
  name: string
  type: string
  order: number
  deletedAt: number | null
  createdAt: number
  updatedAt: number
}

export type AppSheet = {
  id: string
  name: string
  order: number
  deletedAt: number | null
  createdAt: number
  updatedAt: number
  columns: AppColumn[]
  rows: AppRow[]
}
