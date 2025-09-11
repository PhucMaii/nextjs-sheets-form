import {
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { memo, useState } from 'react'
import { blue, grey } from '@mui/material/colors'
import { ImageIcon, Eye } from 'lucide-react'
import dayjs from 'dayjs'
import ViewImg from '../ViewImg'

interface IMergeCheque {
  id: number
  chequeNumber: string
  amount: number
  startDate: string
  endDate: string
  fileKeyFront: string
  fileKeyBack?: string
  createdAt: string
  createdBy: string
  vendorId?: number
  vendor?: {
    id: number
    name: string
  }
  transactions?: Array<{
    id: number
    description: string
    amount: number
    date: string
  }>
}

interface IProps {
  mergeCheques: IMergeCheque[]
}

const MergeChequeTable = ({
  mergeCheques,
}: IProps) => {
  const [viewImgProps, setViewImgProps] = useState<{
    open: boolean
    fileKeyFront: string | null
    fileKeyBack: string | null
  }>({
    open: false,
    fileKeyFront: null,
    fileKeyBack: null,
  })

  const handleViewImage = (cheque: IMergeCheque) => {
    setViewImgProps({
      open: true,
      fileKeyFront: cheque.fileKeyFront,
      fileKeyBack: cheque.fileKeyBack || null,
    })
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = dayjs(startDate).format('MMM DD, YYYY')
    const end = dayjs(endDate).format('MMM DD, YYYY')
    
    if (start === end) {
      return start
    }
    
    return `${start} - ${end}`
  }

  return (
    <>
      <ViewImg
        fileKeyFront={viewImgProps?.fileKeyFront || ''}
        fileKeyBack={viewImgProps?.fileKeyBack || ''}
        open={viewImgProps.open}
        onClose={() =>
          setViewImgProps((prevState) => ({ ...prevState, open: false }))
        }
        isCheque={true}
      />
      
      <Paper sx={{ overflow: 'hidden', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: grey[50] }}>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Cheque Image
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Cheque Number
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Vendor
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Date Range
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Amount
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Uploaded At
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Uploaded By
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mergeCheques.length > 0 ? (
                mergeCheques.map((cheque: IMergeCheque) => (
                  <TableRow
                    key={cheque.id}
                    sx={{
                      '&:hover': { backgroundColor: grey[50] },
                      cursor: 'pointer',
                    }}
                    onClick={() => {}}
                  >
                    {/* Cheque Image */}
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewImage(cheque)
                          }}
                          sx={{
                            '&:hover': {
                              backgroundColor: blue[50],
                            },
                          }}
                        >
                          <ImageIcon size={20} style={{ color: blue[600] }} />
                        </IconButton>
                        <Typography variant="body2" color="text.secondary">
                          View Image
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Cheque Number */}
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {cheque.chequeNumber || 'N/A'}
                      </Typography>
                    </TableCell>

                    {/* Vendor */}
                    <TableCell>
                      <Typography variant="body2">
                        {cheque.vendor?.name || 'N/A'}
                      </Typography>
                    </TableCell>

                    {/* Date Range */}
                    <TableCell>
                      <Typography variant="body2">
                        {cheque.startDate && cheque.endDate
                          ? formatDateRange(cheque.startDate, cheque.endDate)
                          : 'N/A'}
                      </Typography>
                    </TableCell>

                    {/* Amount */}
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="primary.main">
                        ${cheque.amount.toFixed(2)}
                      </Typography>
                    </TableCell>

                    {/* Uploaded At */}
                    <TableCell>
                      <Typography variant="body2">
                        {dayjs(cheque.createdAt).format('MMM DD, YYYY')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(cheque.createdAt).format('h:mm A')}
                      </Typography>
                    </TableCell>

                    {/* Uploaded By */}
                    <TableCell>
                      <Typography variant="body2">
                        {cheque.createdBy}
                      </Typography>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation()
                              {
                                /* onView?.(cheque) */
                              }
                            }}
                            sx={{
                              '&:hover': {
                                backgroundColor: blue[50],
                              },
                            }}
                          >
                            <Eye size={16} style={{ color: blue[600] }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                      <Typography variant="h6" color="text.secondary">
                        No merge cheques found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Upload your first merge cheque to get started
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  )
}

export default memo(MergeChequeTable, (prev, next) => {
  return prev.mergeCheques === next.mergeCheques
})
