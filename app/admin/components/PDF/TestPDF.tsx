import React from 'react'
import { Document, Page, Text, View } from '@react-pdf/renderer'
export default function TestPDF() {
  return (
    <Document>
      <Page>
        <View>
          <Text>Hello World</Text>
        </View>
      </Page>
    </Document>
  )
}
