import {
  Box,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  Grid,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { BoxModal } from './styled';
import ModalHead from '@/app/lib/ModalHead';
import React, { useEffect, useState, useMemo } from 'react';
import { ModalProps } from './type';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import { useParams } from 'next/navigation';
import dayjs from 'dayjs';
import { PresignedFileUpload } from '@/app/components/PresignedFileUpload';
import DisplayFile from './DisplayFile';
import { useQuery } from '@tanstack/react-query';
import { IExpense, IVendor } from '@/app/utils/type';
import { ShowNotificationType } from '@/hooks/useNotification';
import SelectDateRange from '../Select/SelectDateRange';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import DateRange from './DateRangeModal';
import { formatNumberWith2Decimal } from '@/app/utils/number';

interface IProps extends ModalProps {
  showNotification: ShowNotificationType;
  vendor: IVendor | null;
  startDate: Date;
  endDate: Date;
}

interface TransactionStats {
  totalTransactions: number;
  totalAmount: number;
  averageAmount: number;
  selectedAmount: number;
  selectedCount: number;
}

export default function UploadMergeChequeModal({
  open,
  onClose,
  showNotification,
  vendor,
  startDate,
  endDate,
}: IProps) {
  const { companyId }: any = useParams();

  // State management
  const [selectedTransactions, setSelectedTransactions] = useState<IExpense[]>(
    [],
  );
  const [chequeFile, setChequeFile] = useState<string>('');
  const [chequeData, setChequeData] = useState({
    chequeNumber: '',
    amount: 0,
  });
  const [forDateRange, setForDateRange] = useState<Date[]>([
    startDate,
    endDate,
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<Date[]>([startDate, endDate]);
  const [isSelectForRangeOpen, setIsSelectForRangeOpen] =
    useState<boolean>(false);

  // Fetch transactions for selected vendor
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['transactions', vendor?.id, dateRange[0], dateRange[1]],
    queryFn: async () => {
      if (!vendor?.id) return [];
      const response = await axios.get(
        getAdminApiUrl(
          companyId,
          `/expenses?type=vendor&id=${vendor.id}&startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
        ),
      );
      return response.data.data || [];
    },
    enabled: !!vendor?.id,
  });

  // Calculate transaction stats
  const transactionStats: TransactionStats = useMemo(() => {
    if (!transactions) {
      return {
        totalTransactions: 0,
        totalAmount: 0,
        averageAmount: 0,
        selectedAmount: 0,
        selectedCount: 0,
      };
    }

    const totalAmount = transactions.reduce(
      (sum: number, t: IExpense) => sum + t.amount,
      0,
    );
    const selectedAmount = selectedTransactions.reduce(
      (sum: number, t: IExpense) => sum + t.amount,
      0,
    );

    return {
      totalTransactions: transactions.length,
      totalAmount,
      averageAmount:
        transactions.length > 0 ? totalAmount / transactions.length : 0,
      selectedAmount,
      selectedCount: selectedTransactions.length,
    };
  }, [transactions, selectedTransactions]);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setSelectedTransactions([]);
      setChequeFile('');
      setDateRange([startDate, endDate]);
      setForDateRange([startDate, endDate]);
      setChequeData({
        chequeNumber: '',
        amount: 0,
      });
    }
  }, [open]);

  // Update cheque amount when selected transactions change
  // Update for date range when transactions selected
  useEffect(() => {
    // Sort transactions by date
    if (selectedTransactions.length > 0) {
      const sortedTransactions = selectedTransactions.sort(
        (a: IExpense, b: IExpense) =>
          new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      setForDateRange([
        new Date(sortedTransactions[0].date),
        new Date(sortedTransactions[sortedTransactions.length - 1].date),
      ]);
    } else {
      setForDateRange([startDate, endDate]);
    }
    setChequeData((prev) => ({
      ...prev,
      amount: formatNumberWith2Decimal(transactionStats.selectedAmount),
    }));
  }, [transactionStats.selectedAmount]);

  const handleTransactionSelect = (transaction: IExpense, checked: boolean) => {
    if (checked) {
      setSelectedTransactions((prev) => [...prev, transaction]);
    } else {
      setSelectedTransactions((prev) =>
        prev.filter((t) => t.id !== transaction.id),
      );
    }
  };

  const handleSelectAllTransactions = (checked: boolean) => {
    if (checked && transactions) {
      setSelectedTransactions(transactions);
    } else {
      setSelectedTransactions([]);
    }
  };

  const handleFileUploadComplete = (
    uploadedFiles: Array<{ fileKey: string; fileName: string }>,
  ) => {
    if (uploadedFiles.length > 0) {
      setChequeFile(uploadedFiles[0].fileKey);
      showNotification('success', 'Cheque file uploaded successfully');
    }
  };

  const handleUploadError = (error: string) => {
    showNotification('error', error);
  };

  const handleUpload = async () => {
    if (!vendor) {
      showNotification('error', 'Please select a vendor');
      return;
    }

    if (selectedTransactions.length === 0) {
      showNotification('error', 'Please select at least one transaction');
      return;
    }

    if (!chequeFile || !chequeData.chequeNumber || chequeData.amount === 0) {
      showNotification(
        'error',
        'Please fill all required fields and upload cheque file',
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        getAdminApiUrl(companyId, '/cheque/merge-cheque'),
        {
          chequeNumber: chequeData.chequeNumber,
          amount: formatNumberWith2Decimal(chequeData.amount),
          vendorId: vendor.id,
          transactionIds: selectedTransactions.map((t) => t.id),
          fileKeyFront: chequeFile,
          startDate: dayjs(forDateRange[0]).format('MM/DD/YYYY'),
          endDate: dayjs(forDateRange[1]).format('MM/DD/YYYY'),
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
      onClose();
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', error?.response?.data?.error || error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DateRange
        open={isSelectForRangeOpen}
        onClose={() => setIsSelectForRangeOpen(false)}
        dateRange={forDateRange}
        setDateRange={setForDateRange}
      />
      <Modal open={open} onClose={onClose}>
        <BoxModal maxHeight="90vh" overflow="auto" width="1000px">
          <ModalHead
            heading="Upload Merge Cheque"
            buttonLabel="Upload"
            onClick={handleUpload}
            buttonProps={{ loading: isLoading }}
            onClose={onClose}
          />

          <Divider sx={{ my: 2 }} />

          <Box display="flex" flexDirection="column" gap={3}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h3" fontWeight="600" gutterBottom>
                {vendor?.name}
              </Typography>
              <SelectDateRange
                dateRange={dateRange}
                setDateRange={setDateRange}
              />
            </Box>

            {/* Transaction List */}
            {isLoadingTransactions && !transactions && <LoadingComponent />}
            {vendor && transactions && (
              <Card
                sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              >
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6" fontWeight="600">
                      Select Transactions to Merge
                    </Typography>
                    <Box display="flex" gap={1} alignItems="center">
                      <Checkbox
                        checked={
                          selectedTransactions.length === transactions.length &&
                          transactions.length > 0
                        }
                        indeterminate={
                          selectedTransactions.length > 0 &&
                          selectedTransactions.length < transactions.length
                        }
                        onChange={(e) =>
                          handleSelectAllTransactions(e.target.checked)
                        }
                      />
                      <Typography variant="body2">
                        Select All ({selectedTransactions.length}/
                        {transactions.length})
                      </Typography>
                    </Box>
                  </Box>

                  <TableContainer sx={{ maxHeight: 500 }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell padding="checkbox">Select</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Spent By</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {transactions.map((transaction: IExpense) => (
                          <TableRow key={transaction.id} hover>
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={selectedTransactions.some(
                                  (t) => t.id === transaction.id,
                                )}
                                onChange={(e) =>
                                  handleTransactionSelect(
                                    transaction,
                                    e.target.checked,
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell>
                              {dayjs(transaction.date).format('MM/DD/YYYY')}
                            </TableCell>
                            <TableCell>{transaction.description}</TableCell>
                            <TableCell>
                              ${transaction.amount.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={transaction.status}
                                size="small"
                                color={
                                  transaction.status === 'Paid'
                                    ? 'success'
                                    : 'warning'
                                }
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>{transaction.spentBy}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {selectedTransactions.length > 0 && (
                    <Box
                      mt={2}
                      p={2}
                      bgcolor="grey.100"
                      display="flex"
                      justifyContent="flex-end"
                      borderRadius={2}
                    >
                      <Typography
                        variant="h6"
                        color="grey.800"
                        fontWeight="600"
                      >
                        Total: ${transactionStats.selectedAmount.toFixed(2)}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Cheque Upload */}
            <Card
              sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Cheque Information
                </Typography>

                <Box display="flex" flexDirection="column" gap={2}>
                  <Typography>Cheque File</Typography>
                  {chequeFile && <DisplayFile fileKey={chequeFile} isCheque />}
                  <PresignedFileUpload
                    location={`cheques/vendor/${vendor?.name || 'temp'}/${dayjs(forDateRange[0]).format('MM-DD-YYYY')}to${dayjs(forDateRange[1]).format('MM-DD-YYYY')}`}
                    isCheque={true}
                    maxFiles={1}
                    maxSize={10 * 1024 * 1024} // 10MB
                    acceptedFileTypes={['image/*', 'application/pdf']}
                    onUploadComplete={handleFileUploadComplete}
                    onUploadError={handleUploadError}
                    className="mb-4"
                  />

                  <Box display="flex" flexDirection="column" gap={1}>
                    <Typography>Cheque Number</Typography>
                    <TextField
                      value={chequeData.chequeNumber}
                      onChange={(e) => {
                        setChequeData({
                          ...chequeData,
                          chequeNumber: e.target.value,
                        });
                      }}
                      type="number"
                      variant="outlined"
                      size="small"
                      fullWidth
                    />
                  </Box>

                  <Box display="flex" flexDirection="column" gap={1}>
                    <Typography>Amount ($)</Typography>
                    <TextField
                      label="Amount ($)"
                      placeholder="Amount will be auto-calculated from selected transactions"
                      variant="outlined"
                      size="small"
                      type="number"
                      value={chequeData.amount}
                      onChange={(e) => {
                        setChequeData({
                          ...chequeData,
                          amount: +e.target.value,
                        });
                      }}
                      helperText="Amount is automatically calculated from selected transactions"
                    />
                  </Box>

                  <Box display="flex" flexDirection="column" gap={1}>
                    <Typography>For</Typography>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="From"
                          value={
                            forDateRange[0]
                              ? forDateRange[0].toDateString()
                              : ''
                          }
                          onClick={() => setIsSelectForRangeOpen(true)}
                        />
                      </Grid>
                      <Grid item xs={6} textAlign="right">
                        <TextField
                          fullWidth
                          label="To"
                          value={
                            forDateRange[1]
                              ? forDateRange[1].toDateString()
                              : ''
                          }
                          onClick={() => setIsSelectForRangeOpen(true)}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </BoxModal>
      </Modal>
    </>
  );
}
