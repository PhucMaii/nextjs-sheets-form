import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ArticleIcon from '@mui/icons-material/Article';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddBoxIcon from '@mui/icons-material/AddBox';
import HistoryIcon from '@mui/icons-material/History';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PeopleIcon from '@mui/icons-material/People';
import { ORDER_TYPE, PAYMENT_TYPE } from '../utils/enum';
import { COLOR_TYPE } from '../admin/components/StatusText';

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
  { text: ORDER_TYPE.FIXED, type: COLOR_TYPE.SUCCESS },
  { text: ORDER_TYPE.CALL, type: COLOR_TYPE.ERROR },
  { text: ORDER_TYPE.ON_CALL, type: COLOR_TYPE.WARNING },
  { text: ORDER_TYPE.QR_CODE, type: COLOR_TYPE.INFO },
];

export const paymentTypes = [
  PAYMENT_TYPE.COD,
  PAYMENT_TYPE.MONTHLY,
  PAYMENT_TYPE.WCOD,
];
