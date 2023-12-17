export interface Notification {
  on: boolean;
  type: string;
  message: string;
}

export interface InputType {
  positionId?: number;
  inputId: number;
  inputName: string;
  inputType: string;
}

export interface InputValues {
  [key: string]: string | number;
}

export interface PositionType {
  formId: number;
  positionId: number;
  sheetName: string;
  row: number;
  inputs: InputType[];
}

// async function type
export interface FetchForm {
  (fetchForm: void): Promise<void>;
}
