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
  ItemType,
  ItemType_Category,
  Option,
  PaymentMethod,
  PositionIndex,
  Promotion,
  Route,
  ShiftSession,
  User,
  UserRoute,
  Vendor,
  VendorExpense,
  VendorItem,
} from '@prisma/client';
import { Session } from 'next-auth';
import { Order } from '../admin/orders/page';
import { STOCK_STATUS, USER_CATEGORIZED, USER_ROLE } from './enum';

export interface IDayRange extends DayRange {}

export interface BSData {
  quantity: number;
  revenue: number;
  percentage: number;
}

export interface ICustomAmount {
  price: number;
  name: string;
  quantity: number;
  inventoryItemId?: number;
  inventoryItem?: any;
  inventoryUnit?: any;
  inventoryUnitId?: number;
  fifoId?: number;
  units?: any[];
  isCustomAmount: boolean;
  cost?: number;
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
  role?: USER_ROLE;
  type?: USER_CATEGORIZED;
}

export interface ICategory extends Category {
  users?: User[];
  items?: IItem[];

  itemType_category?: ItemType_Category[];
}

export interface IItem {
  id: number;
  name: string;
  categoryId: number;
  category?: ICategory;
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
  fifo?: IFifo;
  fifoId?: number;
  units?: any;
  prevPrice?: number;
  isShowDiscount?: boolean;
  order?: any;
  typeId?: number;
  type?: any;
  options?: IOption[];

  image?: string;
}

export interface OrderedItems {
  id?: number;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
  isShowDiscount?: boolean;
  prevPrice?: number;
  orderId?: number;
  fifoId?: number;
  fifo?: Fifo;
  inventoryItemId?: number;
  inventoryItem?: any;
  inventoryUnitId?: number;
  inventoryUnit?: any;
  isCustomAmount?: boolean;
  units?: IInventoryUnit[];
  option?: any;
}

export interface ScheduledOrder {
  id: number;
  userId: number;
  totalPrice: number;
  items: OrderedItems[] | any[];
  user: UserType;
  day: string;
  alreadyOrder?: boolean;
  blocked?: boolean;
  positionIndex: PositionIndex;
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
  fifo: IFifo[];
  totalValue: number;
  stockStatus: STOCK_STATUS;
  type?: ItemType;
}

export interface IItemType extends ItemType {
  inventoryItems: IInventoryItem[];
}

export interface IVendorItem extends VendorItem {
  inventoryItem?: IInventoryItem;
  vendor?: IVendor;
  quantity: number;
  unit?: any;
  fifo?: IFifo[];
}

export interface IInventoryUnit extends InventoryUnit {
  isSelected?: boolean;
  vendorItem: IVendorItem;
  inventoryItem: IInventoryItem;
}

export interface IFifo extends Fifo {
  inventoryItem: IInventoryItem;
  vendorItem: IVendorItem;
  orderedItems: OrderedItems[];
}

export interface IPromotion extends Promotion {
  items: IInventoryItem[];
}

export interface IOption extends Option {
  // prevPrice?: number;
  // isShowDiscount?: boolean;
  item: IItem;
  unit: IInventoryUnit | any;
}

export interface IShiftSession extends ShiftSession {
  driver: IDriver;
  route?: IRoutes;
}
