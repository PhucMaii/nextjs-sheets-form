import { USER_ROLE } from '@/app/utils/enum';
import prisma from '@/client';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import { getTodayDate } from '@/pages/api/utils/date';
import { getDriverInfo } from '@/pages/api/utils/auth';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
	try {
		const { report }: any = req.body;

		const driver = await getDriverInfo(req, res);

		if (!driver) {
			return res.status(401).json({
				error: 'Unauthorized',
			});
		}

		const today = getTodayDate();
		const createdBy = await getCreatedBy(req, res, USER_ROLE.DRIVER);

		const newReport = await prisma.inventoryReport.create({
			data: {
				companyId: driver.companyId,
				type: report.type,
				note: report.note,
				queryDate: today.date,
				createdAt: today.dateAndTime,
				createdBy: createdBy,
			},
		});

		await prisma.inventoryCount.createMany({
			data: report.inventoryCounts.map((item: any) => ({
				inventoryItemId: item.inventoryItemId,
				inventoryUnitId: item.inventoryUnitId,
				countedQty: item.countedQty,
				reportId: newReport.id,
			})),
		});

		return res.status(200).json({
			data: newReport,
			message: 'Inventory report created successfully',
		});
	} catch (error: any) {
		console.log('Something went wrong while creating inventory report', error);
		return res.status(500).json({
			error: 'Failed to create inventory report',
		});
	}
}

