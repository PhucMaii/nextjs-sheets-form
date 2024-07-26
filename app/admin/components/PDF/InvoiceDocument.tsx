// lib/InvoiceDocument.js
import React from 'react';
import { Page, Text, View, Document } from '@react-pdf/renderer';
import { YYYYMMDDFormat } from '@/app/utils/time';
import { ORDER_STATUS } from '@/app/utils/enum';
import { UserType } from '@/app/utils/type';
import { Order } from '../../orders/page';
import { sendChequeMsg } from '@/app/lib/constant';
import { styles } from './styles';

interface IProps {
  client: UserType | null;
  orders: Order[];
  debtData: any;
  sortDebtKeys: any;
}
const InvoiceDocument: React.FC<IProps> = ({
  client,
  orders,
  debtData,
  sortDebtKeys,
}: IProps) => {
  if (!client) return null;

  const filteredOrders = orders.filter((order: Order) => {
    return (
      order.status !== ORDER_STATUS.VOID &&
      order.status !== ORDER_STATUS.COMPLETED
    );
  });
  const today = new Date();
  const todayString = YYYYMMDDFormat(today);
  const ordersPerPage = 25;
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);


  return (
    <Document>
      {[...Array(totalPages)].map((_, pageIndex) => (
        <Page size="A4" style={styles.page} key={pageIndex}>
          <View style={styles.header}>
            <View style={styles.leftHeader}>
              <Text style={styles.h2}>Supreme Sprouts Ltd.</Text>
              <Text style={styles.subtitle}>
                Unit 1 - 6420 Beresford Street Burnaby, British Columbia V5E
                1B6, Canada
              </Text>
            </View>
            <Text style={styles.h1}>STATEMENT</Text>
            <View>
              <Text style={styles.h2}>Statement Date</Text>
              <Text style={styles.subtitle}>{todayString}</Text>
            </View>
          </View>
          <Text style={styles.h2}>
            To: {client.clientId} - {client.clientName}
          </Text>
          <Text style={styles.body}>
            IF PAYING BY INVOICE, CHECK INDIVIDUAL INVOICES PAID
          </Text>
          <Text style={styles.subtitle}>
            Page: {pageIndex + 1} / {totalPages}
          </Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Invoice No.</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Delivery Date</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Total Bill</Text>
              </View>
            </View>
            {filteredOrders
              .slice(pageIndex * ordersPerPage, (pageIndex + 1) * ordersPerPage)
              .map((order) => (
                <View style={styles.tableRow} key={order.id}>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>{order.id}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>{order.deliveryDate}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>
                      ${order.totalPrice.toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))}
          </View>
          <View style={styles.flex_between}>
            {sortDebtKeys &&
              sortDebtKeys.map((month: string, index: number) => (
                <Text style={styles.font_10} key={index}>
                  {index === sortDebtKeys.length - 2
                    ? 'Current Statement'
                    : month}
                  : ${debtData[month]}
                </Text>
              ))}
          </View>
          <View style={styles.bottomSubtitle}>
            <Text style={styles.h2}>  
            {sendChequeMsg}
            </Text>
          
          </View>
        </Page>
      ))}
    </Document>
  );
};

export default InvoiceDocument;
