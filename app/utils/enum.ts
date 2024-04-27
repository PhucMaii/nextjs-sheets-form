export enum API_URL {
  USER = '/api/user',
  SIGNUP = '/api/signup',
  FORM = '/api/form',
  SHEETS = '/api/sheets',
  IMPORT_SHEETS = '/api/import-sheets',
  ITEM = '/api/item',
  ORDER = '/api/admin/orders',
  ORDER_STATUS = '/api/admin/orders/status',
  ORDERED_ITEMS = '/api/admin/orderedItems',
  CLIENTS = '/api/admin/clients',
  CLIENT_ORDER = '/api/order',
}

export enum ORDER_STATUS {
  COMPLETED = 'Completed',
  INCOMPLETED = 'Incompleted',
  VOID = 'Void',
}

export enum ORDER_TYPE {
  FIXED = 'fixed',
  CALL = 'call',
  ON_CALL = 'on-call',
  QR_CODE = 'qr-code'
}

export enum PAYMENT_TYPE {
  MONTHLY = 'monthly',
  COD = 'cod'
}