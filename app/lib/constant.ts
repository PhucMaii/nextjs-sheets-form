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
import LocalMallIcon from '@mui/icons-material/LocalMall';
import {
  ORDER_STATUS,
  ORDER_TYPE,
  PAYMENT_METHOD_TYPE,
  PAYMENT_TYPE,
  TRANSACTION_STATUS,
} from '../utils/enum';
import { COLOR_TYPE } from '../admin/components/StatusText';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import PendingIcon from '@mui/icons-material/Pending';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BlockIcon from '@mui/icons-material/Block';
import AppBlockingIcon from '@mui/icons-material/AppBlocking';
import SellIcon from '@mui/icons-material/Sell';
import PaymentsIcon from '@mui/icons-material/Payments';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import PaymentIcon from '@mui/icons-material/Payment';
import StoreIcon from '@mui/icons-material/Store';
import InventoryIcon from '@mui/icons-material/Inventory';
import WysiwygIcon from '@mui/icons-material/Wysiwyg';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import {
  errorColor,
  infoColor,
  successColor,
  warningColor,
} from '../../theme/color';
import { amber, brown, grey, orange } from '@mui/material/colors';
import CampaignIcon from '@mui/icons-material/Campaign';
import { AccessTime } from '@mui/icons-material';
import ReportIcon from '@mui/icons-material/Report';
import AutorenewIcon from '@mui/icons-material/Autorenew';

export const mainPaymentMethodId = 4;
export const otherPaymentMethodId = 9;

export const pstRate = 0.07;
export const gstRate = 0.05;

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

export const inventoryOrder = [
  'BEAN 10 LB',
  'BEAN 5 LB',
  'BASIL',
  'BEAN 1 LB',
  'SOYA 10 LB',
  'SOYA 5 LB',
  'SOYA 1 LB',
  'LIME NO. 1',
  'LIME NO. 2',
  'TRADITIONAL TOFU',
  'OG CHINESE PUFF',
  'FRIED TOFU',
  'FIRM TOFU',
  'MEDIUM FIRM TOFU',
  'JUMBO EGG',
  'LARGE EGG',
  'XL EGG',
  'LIQUID EGG 33 LB',
  'EGGPLANTS 30 LB',
  'DAILON 40 LB',
  'BROCCOLI 20 LB',
  'WHITE ONION 50 LB',
  'USA GREEN CABBAGE',
  'LEUCOCASIA / BAC HA 20 LB',
  'LEUCOCASIA / BAC HA 30 LB',
  'TARO',
  'KING OYSTER',
  'SHIITAKE',
  'FRESH RICE NOODLE 1 LB',
  'BANH PHO SINCERE 30 LB',
  'WONTON NOODLE 1 LB',
  'CHOW MEIN 10 LB',
  'ORGANIC GINGER 30 LB',
  'NO. 2 BELL PEPPER 25 LB',
  'PEELED GARLIC 5 LB',
  'JUMBO CARROT',
  'NO. 1 GINGER 30 LB',
  'No. 1 MUSHROOM WHITE 10 LB',
  'No. 2 MUSHROOM WHITE 10 LB',
  'NO. 1 OYSTER MUSHROOM 5 LB',
  'NO. 2 OYSTER MUSHROOM 5 LB',
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
export const testAccountId = 223;
export const TimLeAccountId = 240;
export const clientMaxWidth = '1250px';
export const websiteItemCategoryId = 334;

export const sendChequeMsg = `
* Please either send your payment by cheque 
with company name or memo with client number to:
Unit 1 - 6420 Beresford Street
Burnaby, British Columbia V5E 1B6, Canada

Or e-transfer at info@supremesprout.com
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

export const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const limitOrderHour = 6;
export const limitOrderMinutes = 30;

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
      path: '/admin/cards',
    },
    {
      name: 'Inventory',
      icon: InventoryIcon,
      path: '/admin/inventory',
    },
    {
      name: 'Items',
      icon: SellIcon,
      path: '/admin/items',
    },
    {
      name: 'Users',
      icon: PeopleIcon,
      path: '/admin/clients',
    },
    {
      name: 'Drivers',
      icon: LocalShippingIcon,
      path: '/admin/drivers',
    },
    {
      name: 'Vendors',
      icon: StoreIcon,
      path: '/admin/vendors',
    },
  ],
  Others: [
    {
      name: 'Transactions',
      icon: SyncAltIcon,
      path: '/admin/transactions',
    },
    {
      name: 'Fixed Transactions',
      icon: AutorenewIcon,
      path: '/admin/fixed-transactions',
    },
    {
      name: 'Purchase Orders',
      icon: LocalMallIcon,
      path: '/admin/purchase-orders',
    },
    {
      name: 'C.O.D',
      icon: PaymentsIcon,
      path: '/admin/codBoard',
    },
    {
      name: 'Pre Orders',
      icon: PendingActionsIcon,
      path: '/admin/pre-orders',
    },
    {
      name: 'Shifts',
      icon: AccessTime,
      path: '/admin/shifts',
    },
    {
      name: 'Order Layout',
      icon: WysiwygIcon,
      path: '/admin/order-layout',
    },
    {
      name: 'Promotions',
      icon: CampaignIcon,
      path: '/admin/promotions',
    },
    {
      name: 'Statements',
      icon: DocumentScannerIcon,
      path: '/admin/statements',
    },
    {
      name: 'Product Loss',
      icon: ReportIcon,
      path: '/admin/product-loss',
    },
    {
      name: 'Blocking',
      icon: AppBlockingIcon,
      path: '/admin/blocking',
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
    name: 'Statements',
    icon: DocumentScannerIcon,
    path: '/statements',
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
    name: 'Add',
    icon: AddBoxIcon,
    path: '/driver/add',
  },
  {
    name: 'Shifts',
    icon: AccessTime,
    path: '/driver/shifts',
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
  // {
  //   name: 'Account',
  //   icon: AccountCircleIcon,
  //   path: '/driver/account',
  // },
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
    name: ORDER_STATUS.INCOMPLETED,
    value: ORDER_STATUS.INCOMPLETED,
  },
  {
    color: infoColor,
    icon: LocalShippingIcon,
    name: ORDER_STATUS.DELIVERED,
    value: ORDER_STATUS.DELIVERED,
  },
  {
    color: successColor,
    icon: DoneAllIcon,
    name: ORDER_STATUS.COMPLETED,
    value: ORDER_STATUS.COMPLETED,
  },
  {
    color: errorColor,
    icon: BlockIcon,
    name: ORDER_STATUS.VOID,
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

export const methodTypes = [
  PAYMENT_METHOD_TYPE.CASH,
  PAYMENT_METHOD_TYPE.CREDIT,
  PAYMENT_METHOD_TYPE.DEBIT,
  PAYMENT_METHOD_TYPE.CHEQUE,
  PAYMENT_METHOD_TYPE.OTHER,
];

export const transactionStatusList = [
  TRANSACTION_STATUS.PAID,
  TRANSACTION_STATUS.UNPAID,
];

export const units = ['bags', 'g', 'kg', 'lbs', 'pcs', 'cases', 'cans'];

export const userCategorizedColor: any = {
  Gold: {
    color: amber[600],
    backgroundColor: amber[100],
  },
  Silver: {
    color: grey[600],
    backgroundColor: grey[200],
  },
  Bronze: {
    color: brown[500],
    backgroundColor: orange[100],
  },
  None: {
    color: 'black',
    backgroundColor: 'white',
  },
  Inactive: {
    color: 'black',
    backgroundColor: grey[200],
  },
};

export const otherTypeId = 19;
export const itemsEachRow = 2;
export const testItemId = 10107;
