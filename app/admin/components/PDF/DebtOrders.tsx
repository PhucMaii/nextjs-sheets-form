import { Document, Page, Text, View } from '@react-pdf/renderer';
import React from 'react';
import { Order } from '../../orders/page';
import { styles } from './styles';

interface IProps {
  debtOrders: Order[];
}

const DebtOrders: React.FC<IProps> = ({ debtOrders }) => {
  if (!debtOrders || debtOrders.length === 0) {
    return null; // Return null if there are no orders
  }
  // Convert inches to points (1 inch = 72 points)
  const pageWidth = 2.83 * 72; // 2.83 inches (~72mm width)
  // const pageHeight = 8 * 72; // 8 inches height (arbitrary length, adjust as needed)

  return (
    <Document>
      {debtOrders.map((order, index) => {
        const totalPrice = order.items.reduce(
          (acc, item) => acc + item.totalPrice,
          0,
        );
        const orderFields: any = {
          Invoice: order.id,
          'Client Id': order.user.clientId,
          'Client Name': order.user.clientName,
          'Order Time': order.orderTime,
          'Delivery Date': order.deliveryDate,
        };

        return (
          <Page size={{ width: pageWidth }} style={styles.page} key={index}>
            {order.isReplacement && (
              <Text style={styles.h2}>REPLACEMENT ORDER</Text>
            )}
            <Text style={[styles.font_10, { textAlign: 'center' }]}>
              SUPREME SPROUTS LTD
            </Text>
            <Text style={[styles.subtitle, { textAlign: 'center' }]}>
              1-6420 Beresford Street, Burnaby, BC, V5E 1B3
            </Text>
            <Text style={[styles.subtitle, { textAlign: 'center' }]}>
              778 789 1060
            </Text>
            <Text style={[styles.subtitle, { textAlign: 'center' }]}>
              709 989 6000
            </Text>
            <View style={styles.divider}></View>
            <View style={{ marginTop: 10 }}>
              {Object.keys(orderFields).map((field: string, index: number) => (
                <View
                  key={index}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 10,
                    alignItems: 'center',
                    marginBottom: 10,
                    flexWrap: 'wrap',
                  }}
                >
                  <Text style={styles.subtitle}>{field}:</Text>
                  <Text style={[styles.subtitle, { fontWeight: 'bold' }]}>
                    {orderFields[field]}
                  </Text>
                </View>
              ))}
            </View>

            <Text style={styles.subtitle}>Order Details:</Text>
            <View style={[styles.tableNoBorder, { marginTop: 10 }]}>
              <View style={styles.tableRow}>
                <View style={styles.tableColNoBorder}>
                  <Text style={{ margin: 5, fontSize: 8 }}>Item</Text>
                </View>
                <View style={styles.tableColNoBorder}>
                  <Text style={{ margin: 5, fontSize: 8 }}>No. Items</Text>
                </View>
                <View style={styles.tableColNoBorder}>
                  <Text style={{ margin: 5, fontSize: 8 }}>Unit Price</Text>
                </View>
                <View style={styles.tableColNoBorder}>
                  <Text style={{ margin: 5, fontSize: 8 }}>Total Price</Text>
                </View>
              </View>
              {order.items.map((item) => {
                if (item.quantity === 0) {
                  return null;
                }

                return (
                  <View key={item.id} style={styles.tableRow}>
                    <View style={styles.tableColNoBorder}>
                      <Text style={{ margin: 5, fontSize: 8 }}>
                        {item.name}
                      </Text>
                    </View>
                    <View style={styles.tableColNoBorder}>
                      <Text style={{ margin: 5, fontSize: 8 }}>
                        {item.quantity}
                      </Text>
                    </View>
                    <View style={{...styles.tableColNoBorder, display: 'flex', alignItems: 'center', gap: 1, flexDirection: 'column'}}>
                      {item?.isShowDiscount && item?.prevPrice && (
                        <Text style={{ margin: 5, fontSize: 8, textDecoration: 'line-through' }}>
                          ${item.prevPrice}
                        </Text>
                      )}
                      <Text style={{ margin: 5, fontSize: 8 }}>
                        {item.price}
                      </Text>
                    </View>
                    <View style={{...styles.tableColNoBorder, display: 'flex', alignItems: 'center', gap: 1, flexDirection: 'column'}}>
                    {/* {item?.isShowDiscount &&
                  item?.prevPrice &&
                  item?.totalPrevPrice?.toFixed(2) !==
                    item.totalPrice.toFixed(2) && (
                    <Text style={{ margin: 5, fontSize: 8, textDecoration: 'line-through' }}>
                      ${item?.totalPrevPrice?.toFixed(2)}
                    </Text>
                  )} */}
                      <Text style={{ margin: 5, fontSize: 8 }}>
                        {item.totalPrice?.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
            <View style={styles.divider}></View>
            {
              order?.discount && (
                <View style={styles.flex_between}>
                  <Text style={styles.subtitle}>Discount:</Text>
                  <Text style={styles.subtitle}>
                  ${order?.discount?.toFixed(2)}
                  </Text>
                </View>
              )
            }
            <View style={styles.flex_between}>
              <Text style={styles.subtitle}>Subtotal:</Text>
              <Text style={styles.subtitle}>
                ${order?.subTotal?.toFixed(2) || totalPrice.toFixed(2)}
              </Text>
            </View>
            <View style={styles.flex_between}>
              <Text style={styles.subtitle}>GST (5%):</Text>
              <Text style={styles.subtitle}>
                ${order?.GST?.toFixed(2) || 0}
              </Text>
            </View>
            <View style={styles.flex_between}>
              <Text style={styles.subtitle}>PST (7%):</Text>
              <Text style={styles.subtitle}>
                ${order?.PST?.toFixed(2) || 0}
              </Text>
            </View>

            <View style={styles.divider}></View>
            <View style={styles.flex_between}>
              <Text style={styles.subtitle}>Total:</Text>
              <Text style={styles.subtitle}>${totalPrice.toFixed(2)}</Text>
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: 5,
                marginTop: 10,
                flexWrap: 'wrap',
              }}
            >
              <Text style={styles.subtitle}>Delivery Address:</Text>
              <Text style={styles.subtitle}>{order.user.deliveryAddress}</Text>
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: 5,
                marginTop: 10,
              }}
            >
              <Text style={styles.subtitle}>Contact:</Text>
              <Text style={styles.subtitle}>{order.user.contactNumber}</Text>
            </View>
            {order.note && (
              <>
                <View style={styles.divider}></View>
                <View style={{ display: 'flex', gap: 5 }}>
                  <Text style={styles.subtitle}>NOTE:</Text>
                  <Text style={styles.subtitle}>{order.note}</Text>
                </View>
              </>
            )}
          </Page>
        );
      })}
    </Document>
  );
};

export default DebtOrders;
