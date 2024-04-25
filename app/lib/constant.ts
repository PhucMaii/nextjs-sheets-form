// import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ArticleIcon from '@mui/icons-material/Article';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddBoxIcon from '@mui/icons-material/AddBox';
// import AccountCircleIcon from '@mui/icons-material/AccountCircle';

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
];

export const clientTabs = [
  {
    name: 'Overview',
    icon: DashboardIcon,
    path: '/',
  },
  {
    name: 'Order',
    icon: AddBoxIcon,
    path: '/order',
  },
  // {
  //   name: 'Account',
  //   icon: AccountCircleIcon,
  //   path: '/account',
  // }
];

export const limitOrderHour = 9;
