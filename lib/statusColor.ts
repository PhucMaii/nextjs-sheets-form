import { Program } from '@/app/admin/[companyId]/components/Farm/types';
import { blueGrey, green, red } from '@mui/material/colors';
import { CreditType, PaymentStatus } from '@prisma/client';

export const getCreditReportTypeColor = (type: CreditType) => {
  switch (type) {
    case CreditType.QUALITY_ISSUE:
      return 'error';
    case CreditType.PRICING_ERROR:
      return 'warning';
    case CreditType.CUSTOMER_SATISFACTION:
      return 'info';
    case CreditType.SERVICE_ISSUE:
      return 'error';
    case CreditType.DELIVERY_ISSUE:
      return 'warning';
    default:
      return 'default';
  }
};

export const getProgramStatusColor = (program: Program) => {
  if (!program.isActive) return 'default';
  if (program.remainingDays === 0) return 'success';
  if (program.remainingDays && program.remainingDays <= 3) return 'warning';
  return 'primary';
};

export const getTransactionStatusColor = (status: string) => {
  switch (status) {
    case PaymentStatus.Paid:
      return green[600];
    case PaymentStatus.Unpaid:
      return red[600];
    default:
      return blueGrey[600];
  }
};
