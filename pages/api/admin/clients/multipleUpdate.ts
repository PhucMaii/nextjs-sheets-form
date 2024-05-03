import { ORDER_TYPE, PAYMENT_TYPE } from "@/app/utils/enum";
import { UserType } from "@/app/utils/type";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

interface BodyType {
    clientList: UserType[];
    orderType: ORDER_TYPE;
    paymentType: PAYMENT_TYPE;
}

export default async function MultipleUpdate(req: NextApiRequest, res: NextApiResponse) {
    try {
        const prisma = new PrismaClient();

        const {clientList, orderType, paymentType} = req.body as BodyType;

        const updatePrefFields: any = {};

        if (orderType) {
          updatePrefFields.orderType = orderType;
        }

        if (paymentType) {
          updatePrefFields.paymentType = paymentType;
        }

        const updatedClientList: any[] = [];

        for (const client of clientList) {
            const existingUser = await prisma.user.findUnique({
                where: {
                    id: client.id
                }
            });

            if (!existingUser) {
                return res.status(404).json({
                    error: 'User Not Found'
                });
            }

            if (!existingUser.userPreferenceId) {
                const newPref = await prisma.userPreference.create({
                    data: {
                      userId: existingUser.id,
                      orderType: orderType || 'N/A',
                      paymentType: paymentType || 'N/A',
                    },
                  });
            
                  const updatedUser = await prisma.user.update({
                    where: {
                      id: existingUser.id,
                    },
                    data: {
                      userPreferenceId: newPref.id,
                    },
                    include: {
                        preference: true,
                        category: true,
                    }
                  });
                  updatedClientList.push(updatedUser);
            } else {
                await prisma.userPreference.update({
                    where: {
                      id: existingUser.userPreferenceId,
                    },
                    data: updatePrefFields,
                  });
                
                const updatedUser = await prisma.user.findUnique({
                    where: {
                        id: existingUser.id
                    },
                    include: {
                        preference: true,
                        category: true,
                    }
                })
                updatedClientList.push(updatedUser);
            }
        }

        return res.status(200).json({
            data: updatedClientList,
            message: 'Update Multiple Users Successfully'
        })

    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({
            error: 'Internal Server Error: ' + error
        })
    }
}