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
  DRIVER = 'driver',
}

export enum FLAG_ORDER_TYPE {
  ALREADY_ORDER = 'already order',
  VACATION_ORDER = 'vacation order',
}
