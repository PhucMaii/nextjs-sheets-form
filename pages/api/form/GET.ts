import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export const GETMethod = async (req: NextApiRequest, res: NextApiResponse, prisma: PrismaClient) => {
    try {
        const { id }: any = req.query;
        if(!id) {
            return res.status(400).send('Missing id');
        }
        const data = await prisma.form.findUnique({
            where: {
                form_id: Number(id)
            },
            include: {
                positions: {
                    include: {
                        inputs: true
                    }
                }
            }
        })
        return res.status(200).json({
            data,
            message: `Fetch Form with id ${id} Successfully`
        })
    } catch(error) {
        console.log(error);
        return res.status(500).send('There was an error ' + error )
    }
}