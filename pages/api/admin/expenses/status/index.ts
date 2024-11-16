import { TRANSACTION_STATUS } from "@/app/utils/enum";
import withAdminAuthGuard from "@/pages/api/utils/withAdminAuthGuard"
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

interface IBody {
    id: number;
    status: TRANSACTION_STATUS;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (req.method !== 'PUT') {
            return res.status(404).json({
                error: 'Your method is not supported'
            });
        }

        const prisma = new PrismaClient();
        const { id, status }: IBody = req.body;

        const existingExpense = await prisma.expense.findUnique({
            where: {
                id
            }
        });

        if (!existingExpense) {
            return res.status(404).json({
                error: 'Expense Not Found'
            });
        }

        await prisma.expense.update({
            where: {
                id
            },
            data: {
                status
            }
        });

        return res.status(200).json({
            message: 'Update Expense Status Successfully'
        });
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({
            error: 'Internal Server Error: ' + error
        })
    }
}

export default withAdminAuthGuard(handler);