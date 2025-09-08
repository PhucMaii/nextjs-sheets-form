import { IPayroll } from '@/app/utils/type';
import {
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React, { forwardRef } from 'react';
import './print.css';
import styled from 'styled-components';
import { PayrollType } from '@prisma/client';

interface PropTypes {
  payrolls: IPayroll[];
  currentDate: string;
  companyName?: string;
}

export const BorderTableCell = styled(TableCell)`
  border: 1px solid black;
  padding: 8px;
  text-align: center;
`;

// eslint-disable-next-line react/display-name
export const PayrollPDF = forwardRef(
  ({ payrolls, currentDate }: PropTypes, ref: any) => {
    if (!payrolls || payrolls.length === 0) {
      return (
        <div ref={ref}>
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h4" textAlign="center">
              No Payroll Data Available
            </Typography>
          </Box>
        </div>
      );
    }

    const calculateTotalPayroll = () => {
      return payrolls.reduce(
        (total, payroll) => total + (payroll.total || 0),
        0,
      );
    };

    return (
      <div ref={ref} className="print-container">
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Header */}
          <Typography variant="h4" textAlign="center" m={2}>
            Supreme Sprouts Ltd. - Payroll Report
          </Typography>

          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            gap={4}
            m={2}
            sx={{ width: '100%' }}
          >
            <Typography variant="h6" textAlign="center">
              Report Date: {currentDate}
            </Typography>
            <Typography variant="h6" textAlign="center">
              Total Payroll: ${calculateTotalPayroll().toFixed(2)}
            </Typography>
          </Box>

          <Divider sx={{ my: 2, width: '80%' }} />

          {/* Payroll Table */}
          <Table
            sx={{
              width: '90%',
              maxWidth: '1200px',
              mx: 'auto',
            }}
          >
            <TableHead>
              <TableRow>
                <BorderTableCell
                  sx={{
                    padding: 2,
                    fontSize: 16,
                    fontWeight: 'bold',
                    backgroundColor: '#f5f5f5',
                  }}
                >
                  Driver
                </BorderTableCell>
                <BorderTableCell
                  sx={{
                    padding: 2,
                    fontSize: 16,
                    fontWeight: 'bold',
                    backgroundColor: '#f5f5f5',
                  }}
                >
                  From - To
                </BorderTableCell>
                <BorderTableCell
                  sx={{
                    padding: 2,
                    fontSize: 16,
                    fontWeight: 'bold',
                    backgroundColor: '#f5f5f5',
                  }}
                >
                  Role
                </BorderTableCell>
                <BorderTableCell
                  sx={{
                    padding: 2,
                    fontSize: 16,
                    fontWeight: 'bold',
                    backgroundColor: '#f5f5f5',
                  }}
                >
                  Hours
                </BorderTableCell>
                <BorderTableCell
                  sx={{
                    padding: 2,
                    fontSize: 16,
                    fontWeight: 'bold',
                    backgroundColor: '#f5f5f5',
                  }}
                >
                  Hourly Rate
                </BorderTableCell>
                <BorderTableCell
                  sx={{
                    padding: 2,
                    fontSize: 16,
                    fontWeight: 'bold',
                    backgroundColor: '#f5f5f5',
                  }}
                >
                  Monthly Rate
                </BorderTableCell>
                <BorderTableCell
                  sx={{
                    padding: 2,
                    fontSize: 16,
                    fontWeight: 'bold',
                    backgroundColor: '#f5f5f5',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  Total
                  <Typography variant="caption" fontSize={12}>
                    (before tax)
                  </Typography>
                </BorderTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payrolls.map((payroll, index) => (
                <TableRow key={index}>
                  <BorderTableCell
                    sx={{
                      fontSize: 14,
                      fontWeight: 'bold',
                      textAlign: 'left',
                    }}
                  >
                    {payroll.employee.name}
                  </BorderTableCell>
                  <BorderTableCell
                    sx={{
                      fontSize: 14,
                    }}
                  >
                    {payroll.startDate} - {payroll.endDate}
                  </BorderTableCell>
                  <BorderTableCell
                    sx={{
                      fontSize: 14,
                    }}
                  >
                    {payroll.employee.role}
                  </BorderTableCell>
                  <BorderTableCell
                    sx={{
                      fontSize: 14,
                    }}
                  >
                    {payroll.hours?.toFixed(2) || '0.00'}
                  </BorderTableCell>
                  <BorderTableCell
                    sx={{
                      fontSize: 14,
                    }}
                  >
                    {payroll.employee.payrollType === PayrollType.hourly
                      ? `$${payroll.employee.payRate?.toFixed(2)}` || '0.00'
                      : 'N/A'}
                  </BorderTableCell>
                  <BorderTableCell
                    sx={{
                      fontSize: 14,
                    }}
                  >
                    {payroll.employee.payrollType === PayrollType.monthly
                      ? `$${payroll.employee.payRate?.toFixed(2)}` || '0.00'
                      : 'N/A'}
                  </BorderTableCell>
                  <BorderTableCell
                    sx={{
                      fontSize: 14,
                      fontWeight: 'bold',
                      backgroundColor: '#e8f5e8',
                    }}
                  >
                    ${payroll.total?.toFixed(2) || '0.00'}
                  </BorderTableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Summary Section */}
          <Box
            sx={{
              mt: 4,
              width: '90%',
              maxWidth: '1200px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Divider sx={{ my: 2, width: '100%' }} />
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mt: 2, width: '100%' }}
            >
              <Typography variant="h6" fontWeight="bold">
                Total Employees: {payrolls.length}
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="primary">
                Grand Total: ${calculateTotalPayroll().toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </div>
    );
  },
);
