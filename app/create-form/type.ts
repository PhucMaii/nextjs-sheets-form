export interface InputField {
  name: string;
  type: string;
}

export interface InsertPosition {
  sheetName: string;
  row: number;
  inputFields: InputField[];
}
