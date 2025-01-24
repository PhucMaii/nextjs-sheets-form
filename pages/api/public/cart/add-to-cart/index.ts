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

        // Check if item is existed in cart, then increase the quantity
        if (cartId) {
            const existingItem = await prisma.cartItem.findFirst({
                where: {
                    cartId,
                    itemPreferenceId: item.itemPreferenceId
                }
            });

            if (existingItem) {
                await prisma.cartItem.update({
                    where: {
                        id: existingItem.id
                    },
                    data: {
                        quantity: existingItem + 1
                    }
                })
            }
        }

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
                // init cart
                cart = await prisma.cart.create({
                    data: {
                        subtotal: 0,
                        totalPrice: 0,
                        discount: 0,
                        shippingFee: 0,
                        PST: 0,
                        GST: 0,
                        note: '',
                        createdAt: `${today.date} ${today.time}`,
                        createdBy: `Guest - ${ipAddress}`

                    }
                });
            }
        }

        // Create new item
        const addedItem = await prisma.cartItem.create({
            data: {
                quantity: item.quantity,
                itemPreferenceId: item.itemPreferenceId,
                cartId: cart.id,
                createdAt: `${today.date} ${today.time}`,
                createdBy: `Guest - ${ipAddress}`
            }
        });

        // Get all items in selected cart, including added item
        const allCartItems = await prisma.cartItem.findMany({
            where: {
                cartId: cart.id
            },
            include: {
                itemPreference: {
                    include: {
                        inventoryItem: true,
                    }
                },
            }
        });

        // Format the item to generate total
        const formattedItems = allCartItems.map((item: any) => {
            return {
                ...item.itemPreference,
                quantity: item.quantity,
            }
        })

        // Generate and update cart total
        const total = generateOrderTotalPrice(formattedItems);
        await prisma.cart.update({
            where: {
                id: cart.id
            },
            data: {
                subtotal: total.subTotal,
                totalPrice: total.totalPrice,
                PST: total.PST,
                GST: total.GST,
                discount: total.discount,
                shippingFee: 0, 
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