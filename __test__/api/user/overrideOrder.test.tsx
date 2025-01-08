jest.mock('next-auth', () => {
  console.log('MOCK next-auth');
  ({
  getServerSession: jest.fn().mockResolvedValue({
      user: { name: 'Test User 2', id: 223 },
  }),
})});

import { overrideOrder } from "@/pages/api/import-sheets/utils"
import { testClient, testOrderData } from "./createOrder.test";
import { loginTestAccountBeforeAll } from "@/__test__/setUpAuth";
import { createOrder } from "@/pages/api/admin/orders/POST";
import { ORDER_STATUS } from '../../../app/utils/enum';
import { generateRecommendDate } from "@/app/utils/time";
import UpdateOrderStatus from "../../../pages/api/order/status/index";
import { NextApiResponse } from "next";

// jest.mock('next-auth', () => ({
//     default: jest.fn(() => jest.fn()),
//     getServerSession: jest.fn().mockResolvedValue({
//         user: { name: 'Test User 2', id: 223 },
//     }),
// }));

// jest.mock('next-auth', () => ({
//   default: jest.fn(() => jest.fn()),
//   getServerSession: jest.fn().mockResolvedValue({
//     user: { name: 'Test User 2', id: 223 },
//   }),
// }));

describe('Override Order', () => {
    const mockedRes: jest.Mocked<NextApiResponse> = {
        status: jest.fn().mockReturnValue({ json: jest.fn() }),
      } as unknown as jest.Mocked<NextApiResponse>;
    // loginTestAccountBeforeAll();
    console.log(mockedRes, 'MOCKED RES');
    test('Client Could Not Override Order From The Past', async () => {
        const response = await overrideOrder(
            testClient,
            30843, // Test Account 3 Order on 01/01/2023,
            testOrderData.body.items,
            testOrderData.body.note,
            'Client - 00030',
        );

        expect(response).toHaveProperty('error', 'Cannot override order for past date');
    }, 10000);

    test('Client could create, override, then void order', async () => {
        // CREATE
        const recommendedOrderDate = generateRecommendDate();
        const newOrder = await createOrder(
            testClient,
            testOrderData.body.items,
            recommendedOrderDate,
            testOrderData.body.createdAt,
            'Client - 00030',
        );

        expect(newOrder.deliveryDate).toBe(recommendedOrderDate);
        expect(newOrder.status).toBe(ORDER_STATUS.INCOMPLETED);
        expect(newOrder.items.length).toBe(5);

        // OVERRIDE
        const overridedOrderItems = [
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
              quantity: 3,
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
        ];
        
        const response = await overrideOrder(
            testClient,
            newOrder.id,
            overridedOrderItems,
            testOrderData.body.note,
            'Client - 00030',
        );

        expect(response.ok).toBe(true);
        expect(response.message).toBe('Order Override Successfully');

        // VOID
        const req: any = {
            method: 'PUT',
            body: {
                orderId: newOrder.id,
                updatedStatus: ORDER_STATUS.VOID
            }
        }
      
        const voidedOrder = await UpdateOrderStatus(
           req,
           {
            ...mockedRes,
            getHeader: () => {},
            setHeader: () => {},
          } as unknown as NextApiResponse,
        );

        console.log(mockedRes, 'MOCKED RES');
        expect(mockedRes.status).toHaveBeenCalledWith(200);
        // expect(mockedRes.json).toHaveBeenCalledWith(expect.objectContaining({
        //     message: 'Order Updated Successfully',
        // }));
    }, 30000);
})