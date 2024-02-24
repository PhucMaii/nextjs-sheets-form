import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface InputType {
  name: string;
  type: string;
}

interface BodyType {
  formName: string;
  userId: string;
  inputs: InputType[];
}

export const POSTMethod = async (
  req: NextApiRequest,
  res: NextApiResponse,
  prisma: PrismaClient,
) => {
  const body: BodyType = req.body;
  const submitInputs: InputType[] = body.inputs;
  try {
    const newForm = await prisma.form.create({
      data: {
        formName: body.formName,
        user: { connect: { id: parseInt(body.userId) } },
        inputs: {
          create: [...submitInputs.map((input: InputType) => ({
            inputName: input.name,
            inputType: input.type
          }))]
        },
        lastOpened: new Date(),
      } as any,
    })
    
    return res.status(200).json({
      data: newForm,
      message: 'Form Created Successfully',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send('There was an error: ' + error);
  }
};
