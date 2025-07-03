import { USER_ROLE } from "@/app/utils/enum";
import { getCreatedBy } from "@/pages/api/import-sheets/utils";
import { getTodayDate } from "@/pages/api/utils/date";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from '@/client';

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { companyId } = req.query;
        const { updatedShift } = req.body;

        const today = getTodayDate();
        const createdBy: any = await getCreatedBy(req, res, USER_ROLE.ADMIN);

        if (!Number(updatedShift.id)) {
            // Create new shift
            const newShift = await prisma.scheduledShift.create({
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
                    cost: updatedShift?.cost || updatedShift.hours * (updatedShift?.employee?.payRate || 0),
                    startedAt: updatedShift.startedAt,
                    endedAt: updatedShift.endedAt,
                    role: updatedShift.role},
                include: {
                    employee: {
                        include: {
                            company: true}
                    }}
            });

            return res.status(200).json({ message: 'Shift created successfully', data: newShift });
        }

        const shift = await prisma.scheduledShift.findUnique({
            where: { id: updatedShift.id },
            include: {
                employee: true}
        });

        if (!shift) {
            return res.status(404).json({ error: 'Shift not found' });
        }

        const cost = updatedShift.hours * (shift?.employee?.payRate || 0);

        const updatedScheduledShift = await prisma.scheduledShift.update({
            where: { id: updatedShift.id },
            data: {
                startedAt: updatedShift.startedAt,
                endedAt: updatedShift.endedAt,
                role: updatedShift.role,
                employeeId: updatedShift.employeeId,
                date: updatedShift.date,
                queryDate: updatedShift.queryDate,
                hours: updatedShift.hours,
                cost: cost},
            include: {
                employee: {
                    include: {
                        company: true}
                }
            }
        })

        return res.status(200).json({ message: 'Shift updated successfully', data: updatedScheduledShift });
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}