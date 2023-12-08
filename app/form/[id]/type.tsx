export interface InputType {
  input_id: number;
  input_name: string;
  input_type: string;
}

export interface InputValues {
  [key: string]: string | number;
}

export interface Position {
  form_id: number;
  position_id: number;
  sheet_name: string;
  row: number;
  inputs: InputType[];
}
