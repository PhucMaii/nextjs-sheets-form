import { IQuote } from '@/app/utils/type';
import { styles } from './styles';
import { Document, View, Page, Text } from '@react-pdf/renderer';

interface IProps {
  quote: IQuote;
}

const Quote: React.FC<IProps> = ({ quote }) => {
  if (!quote) {
    return null;
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={[styles.header, styles.font_10]}>
          <View style={styles.leftHeader}>
            <Text style={styles.h2}>Supreme Sprouts Ltd.</Text>
            <Text style={styles.subtitle}>
              Unit 1 - 6420 Beresford Street Burnaby, British Columbia V5E 1B6,
              Canada
            </Text>
          </View>
          <Text style={styles.h1}>QUOTATION</Text>
          <View>
            <Text style={styles.h2}>Created Date</Text>
            <Text style={styles.subtitle}>{quote.createdAt}</Text>
          </View>
        </View>

        <Text style={styles.h2}>To: {quote.user.clientName}</Text>
        <Text style={styles.subtitle}>Page: 1 / 1</Text>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Item</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Price</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Qty</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Total</Text>
            </View>
          </View>
          {quote.items.map((item) => (
            <View style={styles.tableRow} key={item.id}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{item.inventoryItem.name}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>${item.price?.toFixed(2)}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{item.quantity}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  ${(item.price * item.quantity)?.toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
          <View style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}></Text>
            </View>
            <View style={styles.tableCol}></View>
            <View style={styles.tableCol}></View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}></Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Subtotal:</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>${quote.subtotal.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}></Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>PST (7%):</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>${quote.PST.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}></Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>GST (5%):</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>${quote.GST.toFixed(2)}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}></Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Total Bill:</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>
                ${(quote.subtotal + quote.PST + quote.GST).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.h2}>Thank you for your business!</Text>
        <Text style={styles.subtitle}>
          Please contact us if you have any questions.
        </Text>
        
      </Page>
    </Document>
  );
};

export default Quote;
