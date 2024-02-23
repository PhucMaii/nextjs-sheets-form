import { Session } from 'next-auth';

export interface Notification {
  on: boolean;
  type: string;
  message: string;
}

export interface FormType {
  userId: number;
  formId: number;
  formName: string;
  lastOpened: Date;
  positions?: PositionType[];
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
  positionId?: number;
  sheetName: string;
  row: number;
  inputs: InputType[];
}

// async function type
export interface FetchForm {
  (fetchForm: void): Promise<void>;
}

export interface SessionWithId extends Session {
  user: {
    name?: string | null | undefined;
    email?: string | null | undefined;
    image?: string | null | undefined;
    id?: string | null | undefined;
  };
}

export interface SessionClientType {
  data: SessionWithId | null;
  status: string;
}

export interface UserType {
  id?: string;
  clientId: string;
  email: string;
  password?: string;
  sheetName?: string;
}
