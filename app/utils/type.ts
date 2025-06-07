import { AlertColor } from '@mui/material';
import {
  Cart,
  CartItem,
  Category,
  CodBoard,
  Company,
  DayRange,
  Driver,
  Employee,
  Expense,
  Fifo,
  FixedTransaction,
  InventoryItem,
  InventoryUnit,
  ItemPreference,
  ItemType,
  ItemType_Category,
  LossReport,
  Option,
  PaymentMethod,
  Payroll,
  PO,
  POItem,
  PositionIndex,
  Promotion,
  Route,
  ScheduledShift,
  ShiftSession,
  User,
  UserRoute,
  Vendor,
  VendorExpense,
  VendorItem,
} from '@prisma/client';
import { Session } from 'next-auth';
import { Order } from '../admin/[companyId]/orders/page';
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
  // user: {
  //   name?: string | null | undefined;
  //   email?: string | null | undefined;
  //   image?: string | null | undefined;
  //   id?: string | null | undefined;
  //   role?: USER_ROLE;
  // };
}

export interface SessionClientType {
  data: SessionWithId | null;
  status: string;
}

export interface UserType {
  id: number;
  clientId: string;
  clientName: string;
  contactName?: string;
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
  isBestSeller?: boolean;
  qtyLeft?: number;
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
  employee?: Employee;
  clients?: IUserRoutes[];
}

export interface IUserRoutes extends UserRoute {
  user: UserType;
}

export interface IDriver extends Employee {
  routes: IRoutes[];
}

type Cash = {
  orders: Order[];
  amount: number;
};

export interface IBoard extends CodBoard {
  employee: Employee;
  driver: Driver;
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
  vendorItem: IVendorItem[];
}

export interface IInventoryItem extends InventoryItem {
  vendor: IVendor;
  quantity: number;
  vendorItem: IVendorItem[];
  fifo: IFifo[];
  totalValue: number;
  stockStatus: STOCK_STATUS;
  preference?: ItemPreference;
  type?: ItemType;
}

export interface IItemType extends ItemType {
  inventoryItems: IInventoryItem[];
  items: IItem[];
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

export interface IProductType extends ItemType {
  itemPreferences: IItemPreference[];
}

export interface IItemPreference extends ItemPreference {
  inventoryItem: IInventoryItem;
  price: number;
}

export interface ICart extends Cart {
  items: ICartItem[];
}

export interface ICartItem extends CartItem {
  quantity: number;
  cartId: number;
  inventoryUnit: IInventoryUnit;
  itemId: number;
  option: any;

  item: IItem;
}

export type OrderSummary = {
  subtotal: number;
  discount: number;
  totalPrice: number;
  PST: number;
  GST: number;
  shippingFee: number;
};
export interface IPromotion extends Promotion {
  items: IInventoryItem[];
  websiteItems?: IItem[];
}

export interface IOption extends Option {
  // prevPrice?: number;
  // isShowDiscount?: boolean;
  item: IItem;
  unit: IInventoryUnit | any;
}

export interface IShiftSession extends ShiftSession {
  employee: Employee;
  driver: IDriver;
  route?: IRoutes;
}

export interface IPurchaseOrder extends PO {
  poItems: IPOItem[];
  vendor: IVendor;
}

export interface IPOItem extends POItem {
  inventoryUnit: IInventoryUnit;
  inventoryItem: IInventoryItem;
}

export interface IProductLoss extends LossReport {
  inventoryItem?: IInventoryItem;
  inventoryUnit?: IInventoryUnit;
}

export interface IFixedTransaction extends FixedTransaction {
  paymentMethod: IPaymentMethod;
}

export interface IScheduledShift extends ScheduledShift {
  employee: Employee;
}

export interface IEmployee extends Employee {
  scheduledShifts: IScheduledShift[];
  company: Company;
}

export interface IPayroll extends Payroll {
  employee: IEmployee;
  shifts?: number;
  company?: Company;

}