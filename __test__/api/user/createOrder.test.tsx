import { ORDER_STATUS, USER_CATEGORIZED } from '@/app/utils/enum';
import { createOrder } from '@/pages/api/admin/orders/POST';
import { loginTestAccountBeforeAll } from '../../setUpAuth';

loginTestAccountBeforeAll();

// jest.mock('@prisma/client', () => {
//   const mockPrisma = {
//     order: {
//       create: jest.fn().mockResolvedValue({ id: '12345' }),
//     },
//   };
//   return { PrismaClient: jest.fn(() => mockPrisma) };
// });
export const testOrderData: any = {
  body: {
    deliveryDate: '01/01/2024',
    note: '',
    createdAt: '08:11:30 2025-01-08',
    isCheckUnavailableRange: true,
    items: [
      {
        id: 3286,
        name: 'BEAN 10 LB',
        categoryId: 273,
        subCategoryId: null,
        price: 8,
        prevPrice: null,
        isShowDiscount: null,
        availability: true,
        inventoryItemId: 18,
        inventoryUnitId: 2,
        inventoryItem: [Object],
        inventoryUnit: [Object],
        quantity: 2,
      },
      {
        id: 3287,
        name: 'BEAN 5 LB',
        categoryId: 273,
        subCategoryId: null,
        price: 5,
        prevPrice: null,
        isShowDiscount: null,
        availability: true,
        inventoryItemId: 19,
        inventoryUnitId: 3,
        inventoryItem: [Object],
        inventoryUnit: [Object],
        quantity: 0,
      },
      {
        id: 3288,
        name: 'LIQUID EGG 33 LB',
        categoryId: 273,
        subCategoryId: null,
        price: 108,
        prevPrice: 99,
        isShowDiscount: false,
        availability: true,
        inventoryItemId: 17,
        inventoryUnitId: 1,
        inventoryItem: [Object],
        inventoryUnit: [Object],
        quantity: 0,
      },
      {
        id: 3289,
        name: 'SILVER SPROUT 5 LB',
        categoryId: 273,
        subCategoryId: null,
        price: 25,
        prevPrice: null,
        isShowDiscount: null,
        availability: true,
        inventoryItemId: 22,
        inventoryUnitId: 6,
        inventoryItem: [Object],
        inventoryUnit: [Object],
        quantity: 0,
      },
      {
        id: 3357,
        name: 'TEST ITEM - DO NOT DELETE',
        categoryId: 273,
        subCategoryId: null,
        price: 0,
        prevPrice: null,
        isShowDiscount: null,
        availability: true,
        inventoryItemId: 107,
        inventoryUnitId: 72,
        inventoryItem: [Object],
        inventoryUnit: [Object],
        quantity: 0,
      },
    ],
    createdBy: 'client',
  },
};

export const testClient: any = {
  id: 223,
  clientName: 'Test User 2',
  clientId: '00030',
  email: 'maithienphuc0102@gmail.com',
};

describe('Create Order', () => {
  test('Do not allow client to create order in the past', async () => {
    const newOrder = await createOrder(
      testClient,
      testOrderData.body.items,
      '01/01/2024',
      'Client - 00030',
      testOrderData.body.note,
    );
    // expect(newOrder.items.length).toBe(5); // Check if items are valid
    expect(newOrder).toHaveProperty(
      'message',
      'Cannot create order for past date',
    );
  }, 10000);

  test('Do not allow to create for inactive account', async () => {
    const newOrder = await createOrder(
      { ...testClient, type: USER_CATEGORIZED.INACTIVE }, // mod user to inactive
      testOrderData.body.items,
      '01/01/3000',
      'Client - 00030',
      testOrderData.body.note,
    );

    expect(newOrder).toHaveProperty('message', 'Client Account Is INACTIVE');
  }, 10000);

  test('Client Create Order', async () => {
    const newOrder = await createOrder(
      testClient,
      testOrderData.body.items,
      '01/01/3000',
      'Client - 00030',
      testOrderData.body.note,
    );

    expect(newOrder.deliveryDate).toBe('01/01/3000');
    expect(newOrder.status).toBe(ORDER_STATUS.INCOMPLETED);
    expect(newOrder.items.length).toBe(5);
  }, 30000);
});
