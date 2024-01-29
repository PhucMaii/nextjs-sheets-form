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

    if (methodType !== 'POST') {
      delete fieldCheck.inputType;
      delete fieldCheck.positionId;
    }

    // Handle user just update one field only - START HERE
    const existingInput = await prisma.input.findUnique({
      where: {
        inputId: targetInput.inputId,
      },
    });

    if (existingInput) {
      if (targetInput.inputName === existingInput.inputName) {
        return true;
      }
    }
    // END HERE

    const isValid = await prisma.input.findMany({
      where: { ...fieldCheck },
    });

    return isValid.length === 0;
  } catch (error) {
    console.log(error);
  }
}
