import { USER_ROLE } from '@/app/utils/enum';
import prisma from '@/client';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import { errorResponse, successResponse } from '@/pages/api/utils/response';
import { recordAction } from '@/pages/api/utils/timeline';
import withDriverAuthGuard from '@/pages/api/utils/withDriverAuthGuar';
import { ReassignmentStatus } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  orderId: number;
  index: number;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'POST') {
      return errorResponse(res, 'Method not allowed');
    }

    const { orderId, index } = req.body as IBody;

    if (!orderId || !index) {
      return errorResponse(res, 'Order IDs are required');
    }

    const createdBy = await getCreatedBy(req, res, USER_ROLE.DRIVER);

    await prisma.reassignment.updateMany({
      where: {
        orderId: orderId,
      },
      data: {
        status: ReassignmentStatus.ACCEPTED,
        index: index,
      },
    });

    // Record in order timeline
    await recordAction(
      orderId,
      createdBy,
      `${createdBy} accepted order ${orderId}`,
    );

    return successResponse(res, 'Orders accepted successfully');
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return errorResponse(res, error);
  }
};

export default withDriverAuthGuard(handler);
