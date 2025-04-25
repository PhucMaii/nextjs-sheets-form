import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { pdf } from '@react-pdf/renderer'
import POInvoice from '@/app/admin/components/PDF/POInvoice'
import withAdminAuthGuard from '../../utils/withAdminAuthGuard'

const prisma = new PrismaClient()

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query
    if (!id || Array.isArray(id)) {
      return res.status(400).json({ error: 'Missing or invalid id' })
    }
    const poId = parseInt(id, 10)
    const purchaseOrder = await prisma.pO.findUnique({
      where: { id: poId },
      include: {
        poItems: { include: { inventoryItem: true } },
        vendor: true,
      },
    })
    if (!purchaseOrder) {
      return res.status(404).json({ error: 'Purchase order not found' })
    }

    const document = <POInvoice vendor={purchaseOrder.vendor} po={purchaseOrder} />
    const buffer = await pdf(document).toBuffer()

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=PO-${purchaseOrder.poNumber}.pdf`
    )
    res.send(buffer)
  } catch (error: any) {
    console.error('PDF generation error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export default withAdminAuthGuard(handler) 