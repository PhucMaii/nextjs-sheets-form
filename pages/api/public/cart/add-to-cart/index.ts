import { ICartItem } from "@/app/utils/type";
import { generateOrderTotalPrice } from "@/pages/api/admin/orderedItems/PUT";
import { getTodayDate } from "@/pages/api/utils/date";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

interface IBody {
    item: ICartItem;
    cartId: number; // might be incorrect since user can edit localStorage
    userId?: number;
    ipAddress: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== 'POST') {
            return res.status(404).json({
                error: 'Your method is not supported'
            });
        }

        const prisma = new PrismaClient();

        const { item, cartId, userId, ipAddress }: IBody = req.body;

        let cart = null;
        // Prioritize if user id is available because it couldn't be changed by user
        if (userId) {
            cart = await prisma.cart.findFirst({
                where: {
                    userId
                }
            });
        }

        // If user id does not have, then check if id is correct
        // if yes -> update user id
        // else -> create new cart
        const today = getTodayDate();
        if (!cart) {
            cart = await prisma.cart.findUnique({
                where: {
                    id: cartId
                }
            });

            if (cart) {
                await prisma.cart.update({
                    where: {
                        id: cart.id,
                    },
                    data: {
                        userId
                    }
                });
            } else {
                const total = generateOrderTotalPrice([{
                    ...item.itemPreference,
                    quantity: item.quantity,
                }]);
                console.log(total, 'total');
                cart = await prisma.cart.create({
                    data: {
                        subtotal: total.subTotal,
                        totalPrice: total.totalPrice,
                        discount: total.discount,
                        shippingFee: 0,
                        PST: total.PST,
                        GST: total.GST,
                        note: '',
                        createdAt: `${today.date} ${today.time}`,
                        createdBy: `Guest - ${ipAddress}`

                    }
                });
            }
        }

        const addedItem = await prisma.cartItem.create({
            data: {
                quantity: item.quantity,
                itemPreferenceId: item.itemPreferenceId,
                cartId: cart.id,
                createdAt: `${today.date} ${today.time}`,
                createdBy: `Guest - ${ipAddress}`
            }
        });

        return res.status(201).json({
            message: 'Add Item To Cart Successfully',
            data: addedItem
        })

    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({
            error: 'Internal Server Error: ' + error
        })
    }
}