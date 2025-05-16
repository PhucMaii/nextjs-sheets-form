import { compareTwoArraysWithFields } from '@/app/utils/array';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';


const prisma = new PrismaClient();

interface IBody {
  employeeId: number;
  updatedFields: any;
  pageViews: any[];
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { employeeId, updatedFields, pageViews }: IBody = req.body;
    
    const existingEmployee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });
    
    if (!existingEmployee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const employee = await prisma.employee.update({
      where: { id: employeeId },
      data: updatedFields,
      include: {
        adminPages: true,
      },
    });

    const isPageViewChanged = compareTwoArraysWithFields(employee.adminPages, pageViews, ['pageId', 'employeeId']);
    if (employee.adminPages.length === 0 || isPageViewChanged) {
      await prisma.adminPage.deleteMany({
        where: {
          employeeId: employeeId,
        },
      });

      await prisma.adminPage.createMany({
        data: pageViews.map((pageView) => ({
          pageId: pageView.pageId,
          employeeId: employeeId,
        })),
      });
    }


    return res.status(200).json({ data: employee, message: 'Employee Updated Successfully' });
  } catch (error) {
    console.error('Internal server error: ', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}