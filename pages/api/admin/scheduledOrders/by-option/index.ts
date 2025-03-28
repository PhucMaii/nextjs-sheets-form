import withAdminAuthGuard from "@/pages/api/utils/withAdminAuthGuard";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

interface IQuery {
    optionName?: string;
    categoryId?: string;
    itemName?: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (req.method !== 'GET') {
            return res.status(404).json({ error: 'Your method is not supported' });
        }

        const prisma = new PrismaClient();

        const { optionName, itemName, categoryId }: IQuery = req.query;

        if (!optionName || !categoryId) {
            return res.status(404).json({ error: 'Parameters are missing' });
        }

        const preOrderedItems = await prisma.orderedItems.findMany({
            where: {
                name: itemName,
                option: {
                    path: '$.name',
                    equals: optionName
                },
                ScheduleOrders: {
                    user: {
                        category: {
                            id: Number(categoryId)
                        }
                    }
                }
            },
            include: {
                ScheduleOrders: {
                    include: {
                        user: true
                    }
                }
            }
        });

        return res.status(200).json({ data: preOrderedItems });
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({ error: 'Internal Server Error: ' + error });
    }
}

export default withAdminAuthGuard(handler);