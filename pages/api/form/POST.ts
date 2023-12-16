import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface PositionType {
  sheetName: string;
  row: number;
  inputFields: Array<{ name: string; type: string; isChoose: boolean }>;
}

interface SubmitType {
  sheetName: string;
  row: number;
  inputs: {
    create: Array<{ inputName: string; inputType: string }>;
  };
}

interface BodyType {
  formName: string;
  userId: string;
  positions: PositionType[];
}

export const POSTMethod = async (
  req: NextApiRequest,
  res: NextApiResponse,
  prisma: PrismaClient,
) => {
  const body: BodyType = req.body;
  const submitPositions: SubmitType[] = body.positions.map((pos) => {
    return {
      sheetName: pos.sheetName,
      row: pos.row,
      inputs: {
        create: pos.inputFields?.map((input: any) => ({
          inputName: input.name,
          inputType: input.type,
        })),
      },
    };
  });
  try {
    const newForm = await prisma.form.create({
      data: {
        formName: body.formName,
        user: { connect: { id: parseInt(body.userId) } },
        positions: {
          create: [...submitPositions],
        },
        lastOpened: new Date(),
      },
    });
    return res.status(200).json({
      data: newForm,
      message: 'Form Created Successfully',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send('There was an error: ' + error);
  }
};
