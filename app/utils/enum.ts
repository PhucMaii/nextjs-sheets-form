export enum API_URL {
  ADMIN = '/api/admin',
  USER = '/api/user',
  DRIVER = '/api/drivers',
  SIGNUP = '/api/signup',
  FORM = '/api/form',
  SHEETS = '/api/sheets',
  IMPORT_SHEETS = '/api/import-sheets',
  CLIENT_ITEM = '/api/item',
  ITEM = '/api/admin/items',
  ORDER = '/api/admin/orders',
  ORDER_STATUS = '/api/admin/orders/status',
  ORDERED_ITEMS = '/api/admin/orderedItems',
  CLIENTS = '/api/admin/clients',
  CLIENT_ORDER = '/api/order',
  CATEGORIES = '/api/admin/categories',
  SCHEDULED_ORDER = '/api/admin/scheduledOrders',
  SUBCATEGORIES = '/api/admin/subcategories',
  ROUTES = '/api/admin/routes',
  ADMIN_DRIVERS = '/api/admin/drivers',
  DRIVER_ORDERS = '/api/drivers/orders',
}

export enum VIEW_TYPE {
  VENDOR = 'vendor',
  PAYMENT_METHOD = 'paymentMethod',
  ALL = 'all',
}

export enum COD_STATUS {
  IN_PROCESS = 'In Process',
  CLEARED = 'Cleared',
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
  WCOD_SUN = 'WCOD - Sunday',
  WCOD_MON = 'WCOD - Monday',
  WCOD_TUE = 'WCOD - Tuesday',
  WCOD_WED = 'WCOD - Wednesday',
  WCOD_THU = 'WCOD - Thursday',
  WCOD_FRI = 'WCOD - Friday',
  WCOD_SAT = 'WCOD - Saturday',
}

export enum PAYMENT_METHOD_TYPE {
  CASH = 'CASH',
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
  CHEQUE = 'CHEQUE',
  OTHER = 'OTHER',
}

export enum USER_ROLE {
  CLIENT = 'client',
  ADMIN = 'admin',
  DRIVER = 'driver',
}

export enum FLAG_ORDER_TYPE {
  ALREADY_ORDER = 'already order',
  VACATION_ORDER = 'vacation order',
}

export enum FILTER_TYPE {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export enum STOCK_STATUS {
  IN_STOCK = 'In Stock',
  OUT_OF_STOCK = 'Out of Stock',
  LOW_STOCK = 'Low Stock',
}

export enum TRANSACTION_STATUS {
  PAID = 'Paid',
  UNPAID = 'Unpaid',
}
