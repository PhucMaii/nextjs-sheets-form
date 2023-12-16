import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

interface BodyType {
    formId: string,
    formName: string,
}

export default async function PUTMethod(req: NextApiRequest, res: NextApiResponse, prisma: PrismaClient,) {
    try {
        const body: BodyType = req.body;
        const updateForm = await prisma.form.update({
            where: {
                formId: Number(body.formId)
            },
            data: {
                formName: body.formName
            }
        })
        return res.status(200).json({
            data: updateForm,
            message: 'Form Name Updated Succesfully'
        })
    } catch(error) {
        console.log(error, "Error in PUT Method");
        return res.status(500).send('There was something wrong in PUT Method ' + error);
    }
}