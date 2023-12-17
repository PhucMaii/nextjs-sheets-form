import { InputType } from '@/app/utils/type';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import checkValidInput from '../utils/checkValidInput';

export default async function PUTMethod(
  req: NextApiRequest,
  res: NextApiResponse,
  prisma: PrismaClient,
) {
  try {
    const body: InputType = req.body;
    const isValidInput = await checkValidInput(prisma, body, 'PUT');
    if (!isValidInput) {
      return res.status(400).send('Input Name Existed');
    }
    const updatedInput = await prisma.input.update({
      where: {
        inputId: body.inputId,
      },
      data: {
        inputName: body.inputName,
        inputType: body.inputType,
      },
    });

    // update inputs which have same name to be same as type
    await prisma.input.updateMany({
      where: {
        inputName: updatedInput.inputName,
      },
      data: {
        inputName: updatedInput.inputName,
        inputType: updatedInput.inputType,
      },
    });
    return res.status(200).json({
      data: updatedInput,
      message: 'Update Input Successfully',
    });
  } catch (error) {
    return res.status(500).send('Fail to update input, ' + error);
  }
}
