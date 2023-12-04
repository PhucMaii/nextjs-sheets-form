import { Prisma, PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

interface PositionType {
    sheetName: string,
    row: number,
    inputFields: Array<{ name: string; type: string; isChoose: boolean }>
}

interface SubmitType {
    sheet_name: string,
    row: number,
    inputs: {
        create: Array<{ input_name: string; input_type: string }>
    }
}

interface BodyType {
    form_name: string,
    userId: string,
    positions: PositionType[]
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const prisma = new PrismaClient();
    if(req.method !== 'POST') {
        res.status(401).send('ONLY POST METHOD ALLOWED')
    }
    const body: BodyType = req.body;
    const submitPositions: SubmitType[] = body.positions.map((pos) => {
        return {
            sheet_name: pos.sheetName,
            row: pos.row,
            inputs: {
                create: pos.inputFields?.map((input: any) => ({
                  input_name: input.name,
                  input_type: input.type,
                })),
              },
        }
    })
    try {
        const newForm = await prisma.form.create({
            data: {
                form_name: body.form_name,
                user: { connect: { id: parseInt(body.userId) }},
                positions: {
                    create: [...submitPositions] 
                }
            }
        })
        return res.status(200).json({
            data: newForm,
            message: 'Form Created Successfully'
        })
    } catch(error) {
        console.log(error);
        return res.status(500).send('There was an error: ' + error);
    }
    
}