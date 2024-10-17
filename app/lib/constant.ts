import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ArticleIcon from '@mui/icons-material/Article';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddBoxIcon from '@mui/icons-material/AddBox';
import HistoryIcon from '@mui/icons-material/History';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import PeopleIcon from '@mui/icons-material/People';
// import MessageIcon from '@mui/icons-material/Message';
import SettingsIcon from '@mui/icons-material/Settings';
import KitchenIcon from '@mui/icons-material/Kitchen';
import { ORDER_STATUS, ORDER_TYPE, PAYMENT_TYPE } from '../utils/enum';
import { COLOR_TYPE } from '../admin/components/StatusText';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import PendingIcon from '@mui/icons-material/Pending';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BlockIcon from '@mui/icons-material/Block';
import AppBlockingIcon from '@mui/icons-material/AppBlocking';
import SellIcon from '@mui/icons-material/Sell';
import PaymentsIcon from '@mui/icons-material/Payments';
import PaymentIcon from '@mui/icons-material/Payment';
import {
  errorColor,
  infoColor,
  successColor,
  warningColor,
} from '../../theme/color';
import {ReceiptIcon} from 'lucide-react';

export const mainItems = [
  'BEAN 10 LB',
  'BEAN 5 LB',
  'BASIL',
  'BEAN 24X1 LB',
  'SOYA 10 LB',
  'SOYA 5 LB',
  'SOYA 24X1 LB',
  'WHITE MUSHROOM',
  'JUMBO EGG',
  'RICE NOODLE',
  'LIQUID EGG',
  'EGGPLANTS 30 LB',
  'LIME NO. 1',
];

const lighterGreen = '#99FF99'; // Lighter Green
const lighterLimeGreen = '#CCFF99'; // Lighter Lime Green
const lightBananaYellow = '#FFFF99'; // Light Banana Yellow
const lightCoralRed = '#FF9999'; // Light Coral Red
const lightSkyBlue = '#99CCFF'; // Light Sky Blue
const lightPeriwinkle = '#CCCCFF'; // Light Periwinkle
const lightMintGreen = '#CCFFCC'; // Light Mint Green
const lightSalmonPink = '#FFCCCB'; // Light Salmon Pink
const lightLavender = '#E6E6FA'; // Light Lavender
const lightPastelYellow = '#FFFFE0'; // Light Pastel Yellow
const lightPeach = '#FFDAB9'; // Light Peach
const lightTurquoise = '#AFEEEE'; // Light Turquoise
const lightPaleGreen = '#98FB98'; // Light Pale Green

export const productColors = [
  lighterGreen, // BEAN 10 LB
  lighterLimeGreen, // BEAN 5 LB
  lightBananaYellow, // BASIL
  lightCoralRed, // BEAN 24X1 LB
  lightSkyBlue, // SOYA 10 LBS
  lightPeriwinkle, // SOYA 5 LBS
  lightMintGreen, // SOYA 24X1 LB
  lightSalmonPink, // MUSHROOM
  lightLavender, // JUMBO EGG
  lightPastelYellow, // RICE NOODLE
  lightPeach, // LIQUID EGG
  lightTurquoise, // EGG PLANT
  lightPaleGreen, // LIME NO. 1
];
export const officiallyStartDate = new Date(2024, 0, 1); // Month is 0-indexed (0 = January)

export const sendChequeMsg = `
* Please send your payment by cheque to:
Unit 1 - 6420 Beresford Street
Burnaby, British Columbia V5E 1B6, Canada

if we are unable to collect it in person.
Thank you for your cooperation. *
`;

export const days = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const limitOrderHour = 7;

export const adminTabs = {
  Admin: [
    {
      name: 'Overview',
      icon: DashboardIcon,
      path: '/admin/overview',
    },
    {
      name: 'Orders',
      icon: ReceiptLongIcon,
      path: '/admin/orders',
    },
    {
      name: 'C.O.D',
      icon: PaymentsIcon,
      path: '/admin/codBoard',
    },
    {
      name: 'Reports',
      icon: ArticleIcon,
      path: '/admin/reports',
    },
    {
      name: 'Settings',
      icon: SettingsIcon,
      path: '/admin/settings',
    },
  ],
  Manage: [
    {
      name: 'Expenses',
      icon: PaymentIcon,
      path: '/admin/expense',
    },
    {
      name: 'Clients',
      icon: PeopleIcon,
      path: '/admin/clients',
    },
    {
      name: 'Drivers',
      icon: LocalShippingIcon,
      path: '/admin/drivers',
    },
    {
      name: 'Items',
      icon: SellIcon,
      path: '/admin/items',
    },
  ],
  Others: [
    {
      name: 'Blocking',
      icon: AppBlockingIcon,
      path: '/admin/blocking',
    },
    {
      name: 'Pre Orders',
      icon: PendingActionsIcon,
      path: '/admin/pre-orders',
    },
  ],
};

export const tabs = [
  {
    name: 'Overview',
    icon: DashboardIcon,
    path: '/admin/overview',
  },
  {
    name: 'Orders',
    icon: ReceiptLongIcon,
    path: '/admin/orders',
  },
  {
    name: 'Items',
    icon: KitchenIcon,
    path: '/admin/items',
  },
  {
    name: 'Reports',
    icon: ArticleIcon,
    path: '/admin/reports',
  },
  {
    name: 'Clients',
    icon: PeopleIcon,
    path: '/admin/clients',
  },
  {
    name: 'Blocking',
    icon: AppBlockingIcon,
    path: '/admin/blocking',
  },
  {
    name: 'Pre Orders',
    icon: PendingActionsIcon,
    path: '/admin/pre-orders',
  },
];

export const clientTabs = [
  {
    name: 'Overview',
    icon: DashboardIcon,
    path: '/',
  },
  {
    name: 'History',
    icon: HistoryIcon,
    path: '/history',
  },
  {
    name: 'Order',
    icon: AddBoxIcon,
    path: '/order',
  },
  {
    name: 'Account',
    icon: AccountCircleIcon,
    path: '/account',
  },
];

export const driverTabs = [
  {
    name: 'Overview',
    icon: DashboardIcon,
    path: '/driver/overview',
  },
  {
    name: 'Bills',
    icon: ReceiptLongIcon,
    path: '/driver/orders',
  },
  {
    name: 'Order',
    icon: AddBoxIcon,
    path: '/driver/place-order',
  },
  {
    name: 'Blocking',
    icon: AppBlockingIcon,
    path: '/driver/blocking',
  },
  // {
  //   name: 'Message',
  //   icon: MessageIcon,
  //   path: '/driver/message',
  // },
  {
    name: 'Account',
    icon: AccountCircleIcon,
    path: '/driver/account',
  },
];

export const settingsTabs = ['General', 'Announcement'];

export const statusTabs = [
  {
    color: '',
    icon: ReceiptLongIcon,
    name: 'All',
    value: ORDER_STATUS.NONE,
  },
  {
    color: warningColor,
    icon: PendingIcon,
    name: 'Incompleted',
    value: ORDER_STATUS.INCOMPLETED,
  },
  {
    color: infoColor,
    icon: LocalShippingIcon,
    name: 'Delivered',
    value: ORDER_STATUS.DELIVERED,
  },
  {
    color: successColor,
    icon: DoneAllIcon,
    name: 'Completed',
    value: ORDER_STATUS.COMPLETED,
  },
  {
    color: errorColor,
    icon: BlockIcon,
    name: 'Void',
    value: ORDER_STATUS.VOID,
  },
];

export const orderTypes = [
  { text: ORDER_TYPE.FIXED, type: COLOR_TYPE.SUCCESS },
  { text: ORDER_TYPE.CALL, type: COLOR_TYPE.ERROR },
  { text: ORDER_TYPE.ON_CALL, type: COLOR_TYPE.WARNING },
  { text: ORDER_TYPE.QR_CODE, type: COLOR_TYPE.INFO },
];

export const paymentTypes = [
  PAYMENT_TYPE.COD,
  PAYMENT_TYPE.MONTHLY,
  PAYMENT_TYPE.WCOD,
  PAYMENT_TYPE.WCOD_MON,
  PAYMENT_TYPE.WCOD_TUE,
  PAYMENT_TYPE.WCOD_WED,
  PAYMENT_TYPE.WCOD_THU,
  PAYMENT_TYPE.WCOD_FRI,
  PAYMENT_TYPE.WCOD_SAT,
  PAYMENT_TYPE.WCOD_SUN,
];
