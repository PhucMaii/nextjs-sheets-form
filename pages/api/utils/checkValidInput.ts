import { InputType } from '@/app/utils/type';
import { PrismaClient } from '@prisma/client';

interface FieldCheck {
  inputName?: string;
  inputType?: string;
  positionId?: number;
}

export default async function checkValidInput(
  prisma: PrismaClient,
  targetInput: InputType,
  methodType: string,
) {
  try {
    const fieldCheck: FieldCheck = {
      inputName: targetInput.inputName,
      inputType: targetInput.inputType,
      positionId: targetInput.positionId,
    };
    if (methodType === 'POST') {
      delete fieldCheck.inputType;
      delete fieldCheck.positionId;
    }
    const isValid = await prisma.input.findMany({
      where: { ...fieldCheck },
    });
    return isValid.length === 0;
  } catch (error) {
    console.log(error);
  }
}
