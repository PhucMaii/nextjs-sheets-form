import { AlertColor } from '@mui/material';
import { Driver, Route, UserRoute } from '@prisma/client';
import { Session } from 'next-auth';

export interface Notification {
  on: boolean;
  type: AlertColor;
  message: string;
}

export interface FormType {
  userId: number;
  formId: number;
  formName: string;
  lastOpened: Date;
}

export interface InputType {
  formId?: number;
  inputId: number;
  inputName: string;
  inputType: string;
}

export interface InputValues {
  [key: string]: string | number;
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
  id: number;
  clientId: string;
  clientName: string;
  contactNumber: string;
  password?: string;
  email?: string;
  deliveryAddress: string;
  sheetName?: string;
  categoryId?: number;
  subCategoryId?: number;
  subCategory?: any;
  category?: any;
  preference?: any;
}

export interface Item {
  id: number;
  name: string;
  categoryId?: number;
  price: number;
  quantity?: number;
}

export interface OrderedItems {
  id?: number;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
  orderId?: number;
}

export interface ScheduledOrder {
  id?: number;
  userId: number;
  totalPrice: number;
  items: OrderedItems[];
  user: UserType;
}

export interface Routes extends Route {
  driver?: Driver;
  clients?: IUserRoutes[];
}

export interface IUserRoutes extends UserRoute {
  user: UserType;
}
