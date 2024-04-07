export enum API_URL {
  USER = '/api/user',
  SIGNUP = '/api/signup',
  FORM = '/api/form',
  SHEETS = '/api/sheets',
  IMPORT_SHEETS = '/api/import-sheets',
  ORDER = '/api/admin/orders',
  ORDER_STATUS = '/api/admin/orders/status',
  ORDERED_ITEMS = '/api/admin/orderedItems',
  ITEM = '/api/item',
}

export enum ORDER_STATUS {
  COMPLETED = 'Completed',
  INCOMPLETED = 'Incompleted',
  VOID = 'void',
}
