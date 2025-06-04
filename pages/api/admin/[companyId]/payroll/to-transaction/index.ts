import { USER_ROLE } from '@/app/utils/enum';
import prisma from '@/client';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import { getTodayDate } from '@/pages/api/utils/date';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { PaymentStatus } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const { payrollIds, description, paymentMethodId, spentBy, status, date } =
      req.body;

    const payrolls = await prisma.payroll.findMany({
      where: {
        companyId: Number(companyId),
        id: { in: payrollIds },
      },
    });

    if (!payrolls || payrolls.length === 0) {
      return res.status(400).json({ error: 'No payrolls found' });
    }

    const total = payrolls.reduce((acc, payroll) => acc + payroll.total, 0);

    const today = getTodayDate();
    const createdBy = await getCreatedBy(req, res, USER_ROLE.ADMIN);

    // Create new transaction
    const newTransaction = await prisma.expense.create({
      data: {
        companyId: Number(companyId),
        description,
        paymentMethodId,
        spentBy,
        status,
        amount: total,
        subTotal: total,
        PST: 0,
        GST: 0,
        date: date || today.date,
        createdBy,
        createdAt: today.dateAndTime,
      },
    });

    // Update payrolls with transactionId
    await prisma.payroll.updateMany({
      where: { id: { in: payrollIds } },
      data: { transactionId: newTransaction.id, status: PaymentStatus.Paid },
    });

    return res
      .status(200)
      .json({ message: 'Payrolls converted to transaction successfully' });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default withAdminAuthGuard(handler);
