export interface InputField {
    name: string,
    type: string,
    isChoose: boolean
}

export interface InsertPosition {
    sheetName: string,
    row: number
}

export interface Notification {
    on: boolean,
    type: string,
    message: string
}