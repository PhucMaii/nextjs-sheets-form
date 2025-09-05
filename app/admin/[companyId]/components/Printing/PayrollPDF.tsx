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
          <Box sx={{ width: '100%', height: '100%', mr: 4 }}>
            <Typography variant="h4">No Payroll Data Available</Typography>
          </Box>
        </div>
      );
    }

    const calculateTotalPayroll = () => {
      return payrolls.reduce((total, payroll) => total + (payroll.total || 0), 0);
    };

    return (
      <div ref={ref} className="print-container">
        <Box sx={{ width: '90%', height: '100%' }}>
          {/* Header */}
          <Typography variant="h4" textAlign="center" m={2}>
            Supreme Sprouts Ltd. - Payroll Report
          </Typography>
          
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            m={2}
          >
            <Typography variant="h6">
              Report Date: {currentDate}
            </Typography>
            <Typography variant="h6">
              Total Payroll: ${calculateTotalPayroll().toFixed(2)}
            </Typography>
          </Box>
          
          <Divider sx={{ my: 2 }} />

          {/* Payroll Table */}
          <Table sx={{ mx: 2 }}>
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
                  Hourly Rate ($)
                </BorderTableCell>
                <BorderTableCell
                  sx={{
                    padding: 2,
                    fontSize: 16,
                    fontWeight: 'bold',
                    backgroundColor: '#f5f5f5',
                  }}
                >
                  Monthly Rate ($)
                </BorderTableCell>
                <BorderTableCell
                  sx={{
                    padding: 2,
                    fontSize: 16,
                    fontWeight: 'bold',
                    backgroundColor: '#f5f5f5',
                  }}
                >
                  Total ($)
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
                      ? (payroll.employee.payRate?.toFixed(2) || '0.00')
                      : 'N/A'
                    }
                  </BorderTableCell>
                  <BorderTableCell
                    sx={{
                      fontSize: 14,
                    }}
                  >
                    {payroll.employee.payrollType === PayrollType.monthly 
                      ? (payroll.employee.payRate?.toFixed(2) || '0.00')
                      : 'N/A'
                    }
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
          <Box sx={{ mt: 4, mx: 2 }}>
            <Divider sx={{ my: 2 }} />
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mt: 2 }}
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
