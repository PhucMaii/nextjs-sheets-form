import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function DELETEMethod(req: NextApiRequest, res: NextApiResponse, prisma: PrismaClient,) {
    try {
        const { userId, formId } = req.query;
        if(!formId) {
            return res.status(400).send('Missing form id');
        }
        const deletedData = await prisma.user.update({
            where: {
                id: Number(userId)
            }, 
            data: {
                forms: {
                    delete: {
                        form_id: Number(formId),
                    }, 
                }
            }
        })

    } catch(error) {
        return res.status(500).send('There was something wrong ' + error);
    }
}