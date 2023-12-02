export interface SheetForm  {
    sheetName: string,
    row: number,
    revenue?: number,
    expense: number
}

export interface Notification {
  on: boolean,
  type: string,
  message: string
}