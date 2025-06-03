import { Document, Page, Text, View } from '@react-pdf/renderer';
import React from 'react';
import { styles } from './styles';
import { IPayroll } from '@/app/utils/type';

interface IProps {
  payrolls: IPayroll[];
  startDate: string;
  endDate: string;
}

const PayrollPDF = ({ payrolls, startDate, endDate }: IProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.leftHeader}>
            <Text style={styles.h2}>Supreme Sprouts Ltd.</Text>
            <Text style={styles.subtitle}>
              Unit 1 - 6420 Beresford Street Burnaby, British Columbia V5E 1B6,
              Canada
            </Text>
          </View>
          <Text style={styles.h1}>PAYROLL</Text>
          <View>
            <Text style={styles.h2}>Payroll Period</Text>
            <Text style={styles.subtitle}>
              {startDate} - {endDate}
            </Text>
          </View>
        </View>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Employee</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Role</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Payroll Type</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Hours</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Total</Text>
            </View>
          </View>
          {payrolls.map((payroll) => (
            <View style={styles.tableRow} key={payroll.id}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{payroll.employee.name}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{payroll.employee.role}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  {payroll.employee.payrollType}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{payroll.hours}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  ${payroll.total.toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default PayrollPDF;
