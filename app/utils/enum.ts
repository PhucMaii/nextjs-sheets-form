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
  ROUTES = '/api/admin/routes',
  ADMIN_DRIVERS = '/api/admin/drivers',
  PUBLIC = '/api/public',
  DRIVER_ORDERS = '/api/drivers/orders',
}

// Helper function to get admin API URL with companyId
export const getAdminApiUrl = (
  companyId: string,
  path: string,
  query?: string,
) => {
  return `/api/admin/${companyId}${path}${query ? `?${query}` : ''}`;
};

export enum VIEW_TYPE {
  STOCK_PURCHASED = 'stock_purchased',
  CUSTOM_PURCHASED = 'custom_purchased',
  VENDOR = 'vendor',
  PAYMENT_METHOD = 'paymentMethod',
  ALL = 'all',
  FIXED_TRANSACTION = 'fixed_transaction',
}

export enum COD_STATUS {
  IN_PROCESS = 'In Process',
  CLEARED = 'Cleared',
}

export enum ORDER_STATUS {
  NONE = 'none',
  COMPLETED = 'Paid',
  DELIVERED = 'Fulfilled',
  INCOMPLETED = 'Unfulfilled',
  VOID = 'Void',
  PENDING = 'Pending',
}

export enum PROMOTION_STATUS {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
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
  PENDING = 'pending',
  CLIENT = 'client',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super admin',
  DRIVER = 'driver',
  WAREHOUSE = 'warehouse',
  SYSTEM = 'system',
  GUEST = 'guest',
}

export enum EMPLOYEE_ROLE {
  ADMIN = 'admin',
  SUPER_ADMIN = 'super admin',
  DRIVER = 'driver',
  WAREHOUSE = 'warehouse',
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

export enum ACTION {
  TRACK_INVENTORY = 'Track Inventory',
  DISCONNECT_ORDERED_ITEMS = 'Disconnect Ordered Items',
  CANCEL_AFFECT_INVENTORY = 'Cancel Affect Inventory',
  RECORD_INVENTORY = 'Record Inventory',
}

export enum TYPE {
  LOCKED = 'LOCKED',
}

export enum USER_CATEGORIZED {
  GOLD = 'Gold',
  SILVER = 'Silver',
  BRONZE = 'Bronze',
  INACTIVE = 'Inactive',
  PENDING = 'Pending',
  GUEST = 'Guest',
  NONE = 'None',
}

export enum SHIFT_STATUS {
  PAID = 'Paid',
  UNPAID = 'Unpaid',
}

export enum WORKING_ROLE {
  DRIVER = 'Driver',
  IN_FACTORY = 'In Factory',
}

export enum PO_STATUS {
  DRAFT = 'Draft',
  ORDERED = 'Ordered',
  RECEIVED = 'Received',
  CANCELLED = 'Cancelled',
}

export enum LOSS_REPORT_TYPE {
  DAMAGED = 'Damaged',
  EXPIRED = 'Expired',
  OTHER = 'Other',
}

export enum MEDIA_TYPE {
  LOSS_REPORT = 'loss report',
  INVENTORY_ITEM = 'inventory item',
  CHEQUE = 'cheque',
  OTHER = 'other',
}

export enum RECURRENCE_TYPE {
  MONTHLY = 'monthly',
  BI_WEEKLY = 'bi-weekly',
  WEEKLY = 'weekly',
  DAILY = 'daily',
  YEARLY = 'yearly',
}

export enum FIXED_TRANSACTION_STATUS {
  ACTIVE = 'Active',
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  ARCHIVED = 'Archived',
}

export enum QUOTE_STATUS {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}
export enum SCHEDULED_SHIFT_STATUS {
  PUBLISHED = 'PUBLISHED',
  UNPUBLISHED = 'UNPUBLISHED',
}
