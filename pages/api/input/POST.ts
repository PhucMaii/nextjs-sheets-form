import { InputType } from '@/app/utils/type';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import checkValidInput from '../utils/checkValidInput';

export default async function POSTMethod(
  req: NextApiRequest,
  res: NextApiResponse,
  prisma: PrismaClient,
) {
  try {
    const body: InputType = req.body;
    const isValidInput = await checkValidInput(prisma, body, 'POST');
    if (!isValidInput) {
      return res.status(400).send('Input Name Existed');
    }
    const addedInput = await prisma.input.create({
      data: {
        positionId: Number(body.positionId),
        inputName: body.inputName,
        inputType: body.inputType,
      },
    });
    return res.status(201).json({
      data: addedInput,
      message: 'Input Created Succesfully',
    });
  } catch (error) {
    console.log('Fail to create input, ', error);
    return res.status(500).send('Fail to create input ' + error);
  }
}
