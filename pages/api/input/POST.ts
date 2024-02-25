import { InputType } from '@/app/utils/type';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function POSTMethod(
  req: NextApiRequest,
  res: NextApiResponse,
  prisma: PrismaClient,
) {
  try {
    const body: InputType = req.body;
    const addedInput = await prisma.input.create({
      data: {
        formId: body.formId,
        inputName: body.inputName,
        inputType: body.inputType,
      } as any,
    });
    return res.status(201).json({
      data: addedInput,
      message: 'Input Created Succesfully',
    });
  } catch (error) {
    console.log('Fail to create input', error);
    return res.status(500).json({ error: 'Internal Server Error' + error });
  }
}
