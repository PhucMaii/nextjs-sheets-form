import prisma from "@/client";
import { NextApiRequest, NextApiResponse } from "next";
import { normalizeDate } from "../../orders/overview";
import { generateListOfDateString } from "@/app/utils/time";
import { ITEM_CATEGORIZED } from "../../orderedItems/PUT";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { companyId } = req.query;

        if (!companyId) {
            return res.status(400).json({ error: 'Company ID is required' });
        }

        const { updatedSchedules, startDate, endDate } = req.body;

        const formattedStartDate = normalizeDate(startDate);
        const formattedEndDate = normalizeDate(endDate);

        const listOfDates = generateListOfDateString(formattedStartDate, formattedEndDate);

        const existingSchedules = await prisma.programSchedule.findMany({
            where: {
                companyId: Number(companyId),
                date: {
                    in: listOfDates,
                }
            },
        });
        
        if (existingSchedules.length > 0) {
            return res.status(400).json({ error: 'Schedules already exist' });
        }

        // categorize updated schedules
        const categorizedSchedules = categorizeUpdatedSchedules(updatedSchedules);
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({ error: 'Internal Server Error: ' + error });
    }
}

const categorizeProgramSchedules = (
    existingSchedules: any[],
    updatedSchedules: any[],
    comparedField: string = 'id',
) => {
    const categorizedSchedules: any[] = [];
    for (const schedule of updatedSchedules) {
        const existingSchedule = existingSchedules.find(
            (existingSchedule) => existingSchedule[comparedField] === schedule[comparedField],
        );
        
        if (!existingSchedule) {
            categorizedSchedules.push({
                ...schedule,
                type: ITEM_CATEGORIZED.CREATE,
            });
            continue;
        }


    }
    return categorizedSchedules;
}