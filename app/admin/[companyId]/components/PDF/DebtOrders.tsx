import { Document, Page, Text, View } from '@react-pdf/renderer';
import React from 'react';
import { Order } from '../../orders/page';
import { styles } from './styles';
import { generateOrderTotalPrice } from '@/app/utils/orders';

interface IProps {
  debtOrders: Order[];
}

const DebtOrders: React.FC<IProps> = ({ debtOrders }) => {
  if (!debtOrders || debtOrders.length === 0) {
    return null; // Return null if there are no orders
  }

  // Convert inches to points (1 inch = 72 points)
  const pageWidth = 2.83 * 120; // 2.83 inches (~72mm width)
  // const pageHeight = 8 * 72; // 8 inches height (arbitrary length, adjust as needed)

  return (
    <Document>
      {debtOrders.map((order, index) => {
        const total = generateOrderTotalPrice(order.items, order?.shippingFee);
        const GST = total?.GST || 0;
        const PST = total?.PST || 0;
        
        const orderFields: any = {
          Invoice: order.id,
          'Client Id': order?.clientId || order?.user?.clientId,
          'Client Name': order?.clientName || order?.user?.clientName,
          'Order Time': order.orderTime,
          'Delivery Date': order.deliveryDate,
        };

        return (
          <Page size={{ width: pageWidth }} style={styles.page} key={index}>
            {order.isReplacement && (
              <Text style={[styles.h2, { textAlign: 'center', marginBottom: 10 }]}>REPLACEMENT ORDER</Text>
            )}
            <Text style={[styles.font_10, styles.bold, { textAlign: 'center' }]}>
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
            <View style={[styles.divider, { marginTop: 15, marginBottom: 15 }]}></View>
            <View style={{ marginTop: 10, marginBottom: 15 }}>
              {Object.keys(orderFields).map((field: string, fieldIndex: number) => (
                <View
                  key={fieldIndex}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  <Text style={[styles.subtitle, styles.bold]}>{field}:</Text>
                  <Text style={[styles.subtitle, { marginLeft: 5 }]}>
                    {orderFields[field]}
                  </Text>
                </View>
              ))}
            </View>

            <Text style={[styles.subtitle, styles.bold, { marginBottom: 10 }]}>Order Details:</Text>
            <View style={[styles.tableNoBorder, { marginTop: 5 }]}>
              <View style={styles.tableRow}>
                <View style={styles.tableColNoBorder}>
                  <Text style={[styles.subtitle, styles.bold, { margin: 5 }]}>Item</Text>
                </View>
                <View style={styles.tableColNoBorder}>
                  <Text style={[styles.subtitle, styles.bold, { margin: 5 }]}>Qty</Text>
                </View>
                <View style={styles.tableColNoBorder}>
                  <Text style={[styles.subtitle, styles.bold, { margin: 5 }]}>Unit Price</Text>
                </View>
                <View style={styles.tableColNoBorder}>
                  <Text style={[styles.subtitle, styles.bold, { margin: 5 }]}>Total Price</Text>
                </View>
              </View>
              {order.items.map((item) => {
                if (item.quantity === 0) {
                  return null;
                }

                return (
                  <View key={item.id} style={styles.tableRow}>
                    <View style={styles.tableColNoBorder}>
                      <View style={{ margin: 5 }}>
                        <Text style={[styles.subtitle, styles.bold]}>
                          {item.name}
                        </Text>
                        {item?.option?.name && (
                          <Text style={styles.subtitle}>
                            {item?.option?.name}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.tableColNoBorder}>
                      <Text style={[styles.subtitle, styles.bold, { margin: 5 }]}>
                        {item.quantity}
                      </Text>
                    </View>
                    <View
                      style={{
                        ...styles.tableColNoBorder,
                        display: 'flex',
                        alignItems: 'center',
                        flexDirection: 'column',
                      }}
                    >
                      {item?.isShowDiscount && item?.prevPrice && (
                        <Text
                          style={{
                            margin: 5,
                            fontSize: 8,
                            textDecoration: 'line-through',
                          }}
                        >
                          ${item.prevPrice}
                        </Text>
                      )}
                      <Text style={[styles.subtitle, styles.bold, { margin: 5 }]}>
                        ${item.price}
                      </Text>
                    </View>
                    <View
                      style={{
                        ...styles.tableColNoBorder,
                        display: 'flex',
                        alignItems: 'center',
                        flexDirection: 'column',
                      }}
                    >
                      <Text style={[styles.subtitle, styles.bold, { margin: 5 }]}>
                        ${item.totalPrice?.toFixed(2) || (item.quantity * item.price).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
            <View style={[styles.divider, { marginTop: 15, marginBottom: 15 }]}></View>
            
            {total?.discount && total?.discount > 0 && (
              <View style={styles.flex_between}>
                <Text style={styles.subtitle}>Discount ($):</Text>
                <Text style={styles.subtitle}>
                  -${total?.discount?.toFixed(2) || 0}
                </Text>
              </View>
            )}
            
            <View style={styles.flex_between}>
              <Text style={styles.subtitle}>Subtotal:</Text>
              <Text style={styles.subtitle}>
                ${total?.subTotal?.toFixed(2) || order?.subTotal?.toFixed(2) || 0}
              </Text>
            </View>
            
            {order?.shippingFee && order.shippingFee > 0 && (
              <View style={styles.flex_between}>
                <Text style={styles.subtitle}>Shipping Fee:</Text>
                <Text style={styles.subtitle}>
                  ${order?.shippingFee?.toFixed(2) || 0}
                </Text>
              </View>
            )}
            
            <View style={styles.flex_between}>
              <Text style={styles.subtitle}>GST (5%):</Text>
              <Text style={styles.subtitle}>
                ${GST?.toFixed(2) || order?.GST?.toFixed(2) || 0}
              </Text>
            </View>
            <View style={styles.flex_between}>
              <Text style={styles.subtitle}>PST (7%):</Text>
              <Text style={styles.subtitle}>
                ${PST?.toFixed(2) || order?.PST?.toFixed(2) || 0}
              </Text>
            </View>

            <View style={[styles.divider, { marginTop: 15, marginBottom: 15 }]}></View>
            <View style={styles.flex_between}>
              <Text style={[styles.subtitle, styles.bold]}>Total:</Text>
              <Text style={[styles.subtitle, styles.bold]}>
                ${total?.totalPrice?.toFixed(2) || order?.totalPrice?.toFixed(2) || 0}
              </Text>
            </View>
            <View style={{ marginTop: 20, marginBottom: 10 }}>
              <Text style={[styles.subtitle, styles.bold]}>
                DELIVERY ADDRESS: {order?.deliveryAddress || order?.user?.deliveryAddress || 'Not Provided'}
              </Text>
            </View>
            <View style={{ marginBottom: 10 }}>
              <Text style={[styles.subtitle, styles.bold]}>
                CONTACT: {order?.contactNumber || order?.user?.contactNumber || 'Not Provided'}
              </Text>
            </View>
            {order.note && (
              <>
                <View style={[styles.divider, { marginTop: 15, marginBottom: 15 }]}></View>
                <View style={{ marginBottom: 15 }}>
                  <Text style={[styles.subtitle, styles.bold]}>
                    NOTE: {order.note}
                  </Text>
                </View>
              </>
            )}
            
            <View style={[styles.divider, { marginTop: 15, marginBottom: 15 }]}></View>
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <Text style={styles.subtitle}>G: GST (5%)</Text>
                <Text style={styles.subtitle}>P: PST (7%)</Text>
              </View>
              <View style={{ textAlign: 'right' }}>
                <Text style={styles.subtitle}>Order by: {order.createdBy}</Text>
                {order?.updatedBy && (
                  <Text style={styles.subtitle}>Updated by: {order.updatedBy}</Text>
                )}
              </View>
            </View>
          </Page>
        );
      })}
    </Document>
  );
};

export default DebtOrders;
