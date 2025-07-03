import { NextApiRequest, NextApiResponse } from 'next';
import withAdminAuthGuard from '../../../utils/withAdminAuthGuard';
// import { USER_ROLE } from '@/app/utils/enum';
import { getRole } from '@/pages/api/utils/employee';
import prisma from '@/client';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'GET') {
      return res.status(404).json({ error: 'Your method is not supported' });
    }

    const { companyId } = req.query;

    if (!companyId) {
      return res.status(404).json({ error: 'Company Id Not Found' });
    }

    // const admins = await prisma.user.findMany({
    //   where: {
    //     role: {
    //       in: [USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN],
    //     },
    //   },
    // });

    // const drivers = await prisma.driver.findMany({});

    // const adminsAndDrivers = [
    //   ...admins.map((admin: any) => `Admin - ${admin.clientName}`),
    //   ...drivers.map((driver: any) => `Driver - ${driver.name}`),
    // ];

    const employees = await prisma.employee.findMany({
      where: {
        companyId: Number(companyId),
      },
    });

    const adminsAndDrivers = employees.map((employee: any) => {
      const role = getRole(employee.role, employee.name);
      
      return role
    });

    return res.status(200).json({
      data: adminsAndDrivers,
      message: 'Fetch Admins And Drivers Successfully',
    });
  } catch (error) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
};

export default withAdminAuthGuard(handler);
