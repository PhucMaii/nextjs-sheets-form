export interface InputField {
    name: string,
    type: string,
    isChoose: boolean
}

export interface InsertPosition {
    sheetName: string,
    row: number,
    inputFields: InputField[]
}