// export enum API_URL {
//   ADMIN = '/api/admin',
//   USER = '/api/user',
//   SIGNUP = '/api/signup',
//   FORM = '/api/form',
//   SHEETS = '/api/sheets',
//   IMPORT_SHEETS = '/api/import-sheets',
//   CLIENT_ITEM = '/api/item',
//   ITEM = '/api/admin/items',
//   ORDER = '/api/admin/orders',
//   ORDER_STATUS = '/api/admin/orders/status',
//   ORDERED_ITEMS = '/api/admin/orderedItems',
//   CLIENTS = '/api/admin/clients',
//   CLIENT_ORDER = '/api/order',
//   CATEGORIES = '/api/admin/categories',
//   SCHEDULED_ORDER = '/api/admin/scheduledOrders',
//   SUBCATEGORIES = '/api/admin/subcategories',
//   ROUTES = '/api/admin/routes',
//   ADMIN_DRIVERS = '/api/admin/drivers',
//   DRIVER = '/api/drivers',
//   DRIVER_ORDERS = '/api/drivers/orders',
// }
const BASE_URL: any = process.env.NEXT_PUBLIC_API_URL || '';

export const API_URL = {
  ADMIN :`${BASE_URL}/api/admin`,
  USER :`${BASE_URL}/api/user`,
  SIGNUP :`${BASE_URL}/api/signup`,
  FORM :`${BASE_URL}/api/form`,
  SHEETS :`${BASE_URL}/api/sheets`,
  IMPORT_SHEETS :`${BASE_URL}/api/import-sheets`,
  CLIENT_ITEM :`${BASE_URL}/api/item`,
  ITEM :`${BASE_URL}/api/admin/items`,
  ORDER :`${BASE_URL}/api/admin/orders`,
  ORDER_STATUS :`${BASE_URL}/api/admin/orders/status`,
  ORDERED_ITEMS :`${BASE_URL}/api/admin/orderedItems`,
  CLIENTS :`${BASE_URL}/api/admin/clients`,
  CLIENT_ORDER :`${BASE_URL}/api/order`,
  CATEGORIES :`${BASE_URL}/api/admin/categories`,
  SCHEDULED_ORDER :`${BASE_URL}/api/admin/scheduledOrders`,
  SUBCATEGORIES :`${BASE_URL}/api/admin/subcategories`,
  ROUTES :`${BASE_URL}/api/admin/routes`,
  ADMIN_DRIVERS :`${BASE_URL}/api/admin/drivers`,
  DRIVER :`${BASE_URL}/api/drivers`,
  DRIVER_ORDERS :`${BASE_URL}/api/drivers/orders`,
}

export enum ORDER_STATUS {
  NONE = 'none',
  COMPLETED = 'Completed',
  DELIVERED = 'Delivered',
  INCOMPLETED = 'Incompleted',
  VOID = 'Void',
}

export enum ORDER_TYPE {
  NA = 'N/A',
  FIXED = 'FIXED',
  CALL = 'CALL',
  ON_CALL = 'ON CALL',
  QR_CODE = 'QR CODE',
}

export enum PAYMENT_TYPE {
  NA = 'N/A',
  MONTHLY = 'MONTHLY',
  COD = 'COD',
  WCOD = 'WCOD',
}

export enum USER_ROLE {
  CLIENT = 'client',
  ADMIN = 'admin',
}

// export enum SUB_CATEGORIES {
//   BK='B.K',
//   PP='P.P',
//   JUMBO_EGG = 'JUMBO EGG',
//   EXTRA_LARGE_EGG = 'EXTRA LARGE EGG'
// }
