import { grey } from '@mui/material/colors';
import { StyleSheet } from '@react-pdf/renderer';

export const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  leftHeader: {
    display: 'flex',
    flexDirection: 'column',
    width: '33% !important',
  },
  bottomSubtitle: {
    display: 'flex',
    // justifyContent: 'center',
    // alignItems:"center",
    textAlign: 'center',
    marginTop: 20,
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: grey[200],
    marginBottom: 20,
  },
  tableNoBorder: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCol: {
    width: '33%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: grey[200],
  },
  tableColNoBorder: {
    width: '33%',
  },
  tableCell: {
    margin: 5,
    fontSize: 10,
  },
  h1: {
    fontSize: 20,
    textAlign: 'center',
  },
  h2: {
    fontSize: 12,
  },
  subtitle: {
    fontSize: 8,
  },
  body: {
    fontSize: 10,
  },
  flex_between: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    fontSize: 10,
  },
  divider: {
    height: 0.2,
    backgroundColor: grey[200],
    borderWidth: 1,
    borderColor: grey[200],
    marginVertical: 10,
  },
  font_10: {
    fontSize: 10,
  },
  font_5: {
    fontSize: 5,
  },
});
