'use client';
import React from 'react'
import { Document, Page, Text, View } from '@react-pdf/renderer'
import { styles } from './styles'
import { IVendor, IPurchaseOrder } from '@/app/utils/type'

interface IProps {
  vendor: IVendor | null
  po: IPurchaseOrder | null
}

const POInvoice: React.FC<IProps> = ({ vendor, po }: IProps) => {
  if (!vendor || !po) return null

  const items = po.poItems || []
  const itemsPerPage = 25
  const totalPages = Math.ceil(items.length / itemsPerPage)

  return (
    <Document>
      {[...Array(totalPages)].map((_, pageIndex) => (
        <Page size="A4" style={styles.page} key={pageIndex}>
          <View style={styles.header}>
            <View style={styles.leftHeader}>
              <Text style={styles.h2}>Supreme Sprouts Ltd.</Text>
              <Text style={styles.subtitle}>
                1-6420 Beresford Street, Burnaby, BC, V5E 1B3
              </Text>
            </View>
            <Text style={styles.h1}>PURCHASE ORDER</Text>
            <View>
              <Text style={styles.h2}>Page</Text>
              <Text style={styles.subtitle}>
                {pageIndex + 1} / {totalPages}
              </Text>
            </View>
          </View>

          <Text style={styles.h2}>To: {vendor.name}</Text>

          <Text style={styles.h2}>Purchase Order Details</Text>
          <Text style={styles.body}>PO Number: #{po.poNumber}</Text>
          <Text style={styles.body}>
            Expected Arrival Date: {po.estArrival}
          </Text>
          {po.note && <Text style={styles.body}>Note: {po.note}</Text>}

          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Item Name</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Quantity</Text>
              </View>
            </View>
            {items
              .slice(
                pageIndex * itemsPerPage,
                (pageIndex + 1) * itemsPerPage
              )
              .map(item => (
                <View style={styles.tableRow} key={item.id}>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>
                      {item.inventoryItem.name}
                    </Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>
                      {item.orderedQty}
                    </Text>
                  </View>
                </View>
              ))}
          </View>

          <View style={styles.bottomSubtitle}>
            <Text style={styles.h2}>Louis Le</Text>
            <Text style={styles.subtitle}>Supreme Sprouts Ltd.</Text>
            <Text style={styles.subtitle}>
              1-6420 Beresford Street, Burnaby, BC, V5E 1B3
            </Text>
            <Text style={styles.subtitle}>
              Contact: 778-789-1060 | 709-989-6000
            </Text>
            <Text style={styles.subtitle}>
              Website: supremesprouts.com
            </Text>
          </View>
        </Page>
      ))}
    </Document>
  )
}

export default POInvoice
