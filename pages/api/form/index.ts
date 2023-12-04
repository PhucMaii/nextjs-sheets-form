import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const prisma = new PrismaClient();
    if(req.method === "POST") {
        const body = req.body;
        try {
            const newForm = await prisma.form.create({
                data: {
                    form_name: 'Form Name',
                    user: { connect: { id: 1 } },
                    positions: {
                        create: [
                        {
                            sheet_name: 'MAIN',
                            row: 3,
                            inputs: 
                            {create :[
                            {
                                input_name: 'Input Name',
                                input_type: 'Text'
                            }
                        ]}
                        }
                    ]}
                }
            })

        } catch(error) {
            console.log(error);
        }
    }
}