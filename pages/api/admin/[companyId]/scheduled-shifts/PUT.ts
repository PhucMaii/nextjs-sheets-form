import { getCreatedBy } from "@/pages/api/import-sheets/utils";
import { getTodayDate } from "@/pages/api/utils/date";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { companyId } = req.query;
        const { updatedShift } = req.body;

        const today = getTodayDate();
        const createdBy: any = await getCreatedBy(req, res);

        if (!parseInt(updatedShift.id)) {
            // Create new shift
            await prisma.scheduledShift.create({
                data: {
                    companyId: Number(companyId),
                    createdAt: today.dateAndTime,
                    createdBy: createdBy,
                    assignedBy: createdBy,
                    assignedAt: today.dateAndTime,
                    employeeId: Number(updatedShift.employeeId),
                    date: updatedShift.date,
                    queryDate: updatedShift.queryDate,
                    hours: updatedShift.hours,
                    cost: updatedShift.cost,
                    startedAt: updatedShift.startedAt,
                    endedAt: updatedShift.endedAt,
                    role: updatedShift.role,
                }
            });

            return res.status(200).json({ message: 'Shift created successfully' });
        }



        const shift = await prisma.scheduledShift.findUnique({
            where: { id: updatedShift.id },
            include: {
                employee: true,
            }
        });

        if (!shift) {
            return res.status(404).json({ error: 'Shift not found' });
        }

        const cost = updatedShift.hours * (shift?.employee?.hourlyRate || 0);

        await prisma.scheduledShift.update({
            where: { id: updatedShift.id },
            data: {
                startedAt: updatedShift.startedAt,
                endedAt: updatedShift.endedAt,
                role: updatedShift.role,
                employeeId: updatedShift.employeeId,
                date: updatedShift.date,
                queryDate: updatedShift.queryDate,
                hours: updatedShift.hours,
                cost: cost,
            }
        })

        return res.status(200).json({ message: 'Shift updated successfully' });
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}