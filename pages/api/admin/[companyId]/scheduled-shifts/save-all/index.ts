import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { NextApiRequest, NextApiResponse } from 'next';
import { ITEM_CATEGORIZED } from '../../orderedItems/PUT';
import { formatDate, getTodayDate } from '@/pages/api/utils/date';
import { generateListOfDateString } from '@/app/utils/time';
import { PrismaClient } from '@prisma/client';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import { USER_ROLE } from '@/app/utils/enum';

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { companyId } = req.query;
    const { shifts, startedAt, endedAt } = req.body;

    const formattedStartDate = formatDate(startedAt);
    const formattedEndDate = formatDate(endedAt);

    const listOfDateString = generateListOfDateString(
      formattedStartDate,
      formattedEndDate,
    );

    console.log({ listOfDateString, startedAt, endedAt });

    const baseShifts = await prisma.scheduledShift.findMany({
      where: {
        companyId: Number(companyId),
        queryDate: {
          in: listOfDateString,
        },
      },
    });

    const categorizedShifts = categorizeShifts(shifts, baseShifts);

    const today = getTodayDate();
    // const session: any = await getServerSession(req, res, authOptions);
    const createdBy = await getCreatedBy(req, res, USER_ROLE.ADMIN);

    // Create new shifts
    const createShifts = categorizedShifts.filter(
      (shift) => shift.type === ITEM_CATEGORIZED.CREATE,
    );
    if (createShifts.length > 0) {
      await prisma.scheduledShift.createMany({
        data: createShifts.map((shift) => ({
          companyId: Number(companyId),
          startedAt: shift.startedAt,
          endedAt: shift.endedAt,
          role: shift.role,
          employeeId: shift.employeeId,
          date: shift.date,
          queryDate: shift.queryDate,
          hours: shift.hours,
          createdAt: today.dateAndTime,
          createdBy: createdBy,
          assignedBy: createdBy,
          assignedAt: today.dateAndTime,
          cost: shift?.cost || shift.hours * (shift?.employee?.hourlyRate || 0),
        })),
      });
    }
    
    // Update existing shifts
    const updateShifts = categorizedShifts.filter(
      (shift) => shift.type === ITEM_CATEGORIZED.UPDATE,
    );

    if (updateShifts.length > 0) {
      for (const shift of updateShifts) {
        await prisma.scheduledShift.update({
          where: { id: shift.id },
          data: {
            startedAt: shift.startedAt,
            endedAt: shift.endedAt,
            role: shift.role,
            employeeId: shift.employeeId,
            date: shift.date,
            queryDate: shift.queryDate,
            hours: shift.hours,
            cost: shift.cost,
          },
        });
      }
    }

    const returnUpdatedData = await prisma.scheduledShift.findMany({
      where: {
        companyId: Number(companyId),
        queryDate: {
          in: listOfDateString,
        },
      },
      include: {
        employee: {
          include: {
            company: true,
          },
        },
      },
    });
    return res
      .status(200)
      .json({ message: 'Shifts saved successfully', data: returnUpdatedData });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default withAdminAuthGuard(handler);

const categorizeShifts = (updatedShifts: any[], baseShifts: any[]) => {
  // console.log('baseShifts', {baseShifts});
  // return [];
  const newShifts = updatedShifts.map((shift) => {
    const existingShift = baseShifts.find(
      (baseShift: any) => baseShift.id === shift.id,
    );

    if (!existingShift) {
      return {
        ...shift,
        type: ITEM_CATEGORIZED.CREATE,
      };
    }

    if (
      existingShift.startedAt !== shift.startedAt ||
      existingShift.endedAt !== shift.endedAt ||
      existingShift.role !== shift.role ||
      existingShift.employeeId !== shift.employeeId
    ) {
      return {
        ...shift,
        type: ITEM_CATEGORIZED.UPDATE,
      };
    }

    return {
      ...shift,
      type: ITEM_CATEGORIZED.REMAIN,
    };
  });

  return newShifts;
};
