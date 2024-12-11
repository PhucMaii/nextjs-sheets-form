import { AlertColor } from '@mui/material';
import {
  Category,
  CodBoard,
  DayRange,
  Driver,
  Expense,
  Fifo,
  InventoryItem,
  InventoryUnit,
  PaymentMethod,
  Route,
  User,
  UserRoute,
  Vendor,
  VendorExpense,
  VendorItem,
} from '@prisma/client';
import { Session } from 'next-auth';
import { Order } from '../admin/orders/page';
import { STOCK_STATUS } from './enum';

export interface IDayRange extends DayRange {}

export interface BSData {
  quantity: number;
  revenue: number;
  percentage: number;
}

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
  // subCategoryId?: number;
  // subCategory?: any;
  category?: any;
  preference?: any;
}

export interface ICategory extends Category {
  users?: User[];
  items?: IItem[];
}

export interface IItem {
  id: number;
  name: string;
  categoryId: number;
  // subCategoryId?: number | null;
  price: number;
  quantity?: number;
  // subCategory?: any;
  availability: boolean;
  user?: User;
  inventoryItemId?: number;
  inventoryItem?: any;
  unit?: any;
  inventoryUnitId?: number;
  inventoryUnit?: any;
  units?: any;
  prevPrice?: number;
  isShowDiscount?: boolean;
}

export interface OrderedItems {
  id?: number;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
  orderId?: number;
  inventoryItemId?: number;
  inventoryItem?: any;
  inventoryUnitId?: number;
  inventoryUnit?: any;
}

export interface ScheduledOrder {
  id: number;
  userId: number;
  totalPrice: number;
  items: OrderedItems[];
  user: UserType;
  day: string;
  alreadyOrder?: boolean;
  blocked?: boolean;
}

export interface IRoutes extends Route {
  driver?: Driver;
  clients?: IUserRoutes[];
}

export interface IUserRoutes extends UserRoute {
  user: UserType;
}

export interface IDriver extends Driver {
  routes: IRoutes[];
}

type Cash = {
  orders: Order[];
  amount: number;
};

export interface IBoard extends CodBoard {
  driver: IDriver;
  uncollected: Cash;
  collected: Cash;
  boardClients: UserType[];
  orders: Order[];
  totalAmount: number;
  expense: IExpense[];
  cashDiff: number;
}

export interface IExpense extends Expense {
  paymentMethod: IPaymentMethod;
  vendors?: VendorExpense[];
  orderedItems?: OrderedItems[];
}

export interface IPaymentMethod extends PaymentMethod {
  transactions: IExpense[];
}

export interface IVendor extends Vendor {
  inventoryItems: any;
}

export interface IInventoryItem extends InventoryItem {
  vendor: IVendor;
  quantity: number;
  vendorItem: IVendorItem[];
  fifo: Fifo[];
  totalValue: number;
  stockStatus: STOCK_STATUS;
}

export interface IVendorItem extends VendorItem {
  inventoryItem?: IInventoryItem;
  vendor?: IVendor;
  quantity: number;
  unit?: any;
  fifo?: Fifo[];
}

export interface IInventoryUnit extends InventoryUnit {
  isSelected?: boolean;
  vendorItem: IVendorItem;
  inventoryItem: IInventoryItem;
}
