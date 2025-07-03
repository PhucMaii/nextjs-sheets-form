import { USER_CATEGORIZED, USER_ROLE } from '@/app/utils/enum';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import emailHandler, {
  generateApproveToBePartnerEmail,
} from '@/pages/api/utils/email';
import prisma from '@/client';

interface IBody {
  id: number;
  newClientId: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'PUT') {
      return res.status(404).json({ error: 'Your method is not supported' });
    }

    const { id, newClientId }: IBody = req.body;

    if (newClientId.trim() === '') {
      return res.status(404).json({ error: 'You are missing body data' });
    }

    const existingClient = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!existingClient) {
      return res.status(404).json({ error: 'Client Not Found' });
    }

    if (
      existingClient?.type !== USER_CATEGORIZED.PENDING &&
      existingClient?.type === USER_ROLE.CLIENT
    ) {
      return res.status(404).json({ error: 'Client Already Approved' });
    }

    const password = await bcrypt.hash(
      existingClient?.contactNumber || 'welcomeToOurApp',
      10,
    );

    const updatedClient = await prisma.user.update({
      where: {
        id: existingClient.id,
      },
      data: {
        clientId: newClientId.trim(),
        role: USER_ROLE.CLIENT,
        type: USER_CATEGORIZED.NONE,
        password,
      },
    });

    const template = generateApproveToBePartnerEmail(updatedClient);

    if (updatedClient.email) {
      await emailHandler(
        updatedClient.email,
        'Welcome to the Supreme Sprouts Family!',
        'Welcome to the Supreme Sprouts Family!',
        template,
      );
    }

    return res.status(200).json({ message: 'Client Approved Successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
};

export default withAdminAuthGuard(handler);
