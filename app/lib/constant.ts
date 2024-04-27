import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ArticleIcon from '@mui/icons-material/Article';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddBoxIcon from '@mui/icons-material/AddBox';
import HistoryIcon from '@mui/icons-material/History';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PeopleIcon from '@mui/icons-material/People';
import { ORDER_TYPE, PAYMENT_TYPE } from '../utils/enum';

export const limitOrderHour = 9;

export const tabs = [
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
    name: 'Clients',
    icon: PeopleIcon,
    path: '/admin/clients',
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

export const orderTypes = [
  ORDER_TYPE.FIXED,
  ORDER_TYPE.CALL,
  ORDER_TYPE.ON_CALL,
  ORDER_TYPE.QR_CODE,
];

export const paymentTypes = [
  PAYMENT_TYPE.COD,
  PAYMENT_TYPE.MONTHLY
];
