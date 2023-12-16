import { InputType, PositionType } from "@/app/utils/type";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function PUTMethod(req: NextApiRequest, res: NextApiResponse, prisma: PrismaClient) {
    try {
        const body: PositionType = req.body;
        const inputsData = body.inputs.map(({ inputId, inputName, inputType }) => ({
            inputName,
            inputType,
        }));
        const updatePosition = await prisma.position.update({
            where: {
                positionId: body.positionId
            },
            data: {
                sheetName: body.sheetName,
                row: body.row,
                inputs: {
                    deleteMany: {
                        // Use the correct field name in the deleteMany condition
                        inputId: {
                            in: body.inputs.map(({ inputId }) => inputId)
                        }
                    },
                    createMany: {
                        data: inputsData
                    }
                }
            }
        });

        return res.status(200).json({
            data: updatePosition,
            message: `Position Updated Successfully`
        });
    } catch(error) {
        console.log(error, 'UPdate error');
        return res.status(500).send('There was an error with Update Method ' + error);
    }
}