'use client';
import React, { useState, useMemo } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import { Virtuoso } from 'react-virtuoso';
import useDebounce from '@/hooks/useDebounce';
import {
  Box,
  Typography,
  Tab,
  Tabs,
  Grid,
  TextField,
  InputAdornment,
  useMediaQuery,
  alpha,
  Paper,
  Button,
  Checkbox,
  Slide,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Receipt as ReceiptIcon,
  LocalShipping as LocalShippingIcon,
  Download as DownloadIcon,
  CheckBox as CheckBoxIcon,
} from '@mui/icons-material';
import ViewImg from '../components/ViewImg';
import { primary, neutral } from '@/theme/color';
import { IFile, IVendor, UserType } from '@/app/utils/type';
import { EvidenceType } from '@prisma/client';
import EmptyFiles from '../components/Files/EmptyFiles';
import { useQuery } from '@tanstack/react-query';
import useFiles from '@/hooks/db-tables/useFiles';
import { useParams } from 'next/navigation';
import Cheque from '../components/Files/Cheque';
import { generateMonthRange } from '@/app/utils/time';
import SelectDateRange from '../components/Select/SelectDateRange';
import { getAdminApiUrl } from '@/app/utils/enum';
import axios from 'axios';
import { ShadowSection } from '../reports/styled';
import ClientSearch from '../components/Autocomplete/ClientSearch';
import { blueGrey } from '@mui/material/colors';
import PeopleIcon from '@mui/icons-material/People';
import StoreIcon from '@mui/icons-material/Store';
import VendorSearch from '../components/Autocomplete/VendorSearch';
import DescriptionIcon from '@mui/icons-material/Description';
import FileCardSkeleton from '../components/Skeleton/FileCardSkeleton';
import DeliveryProofOrInvoice from '../components/Files/DeliveryProofOrInvoice';
import TransactionTypeSearch from '../components/Autocomplete/TransactionTypeSearch';
import useNotification from '@/hooks/useNotification';

const clientTabs = [
  {
    label: 'Client Cheque',
    value: 'client-cheque',
    icon: <ReceiptIcon sx={{ fontSize: 18 }} />,
  },
  {
    label: 'Delivery Proof',
    value: 'delivery-proof',
    icon: <LocalShippingIcon sx={{ fontSize: 18 }} />,
  },
];

const vendorTabs = [
  {
    label: 'Cheque',
    value: 'vendor-cheque',
    icon: <ReceiptIcon sx={{ fontSize: 18 }} />,
  },
  {
    label: 'Invoices',
    value: 'invoices',
    icon: <DescriptionIcon sx={{ fontSize: 18 }} />,
  },
];

const transactionTabs = [
  {
    label: 'Cheque',
    value: 'transaction-cheque',
    icon: <ReceiptIcon sx={{ fontSize: 18 }} />,
  },
  {
    label: 'Invoices',
    value: 'transaction-invoices',
    icon: <DescriptionIcon sx={{ fontSize: 18 }} />,
  },
];

export default function FilesPage() {
  const { companyId }: any = useParams();
  const {
    getClientChequeFiles,
    getVendorChequeFiles,
    getDeliveryProofFiles,
    getInvoices,
    getTransactionChequeFiles,
  } = useFiles();
  const { showNotification, NotificationComp } = useNotification();
  const [activeTab, setActiveTab] = useState<
    | 'client-cheque'
    | 'vendor-cheque'
    | 'delivery-proof'
    | 'invoices'
    | 'transaction-cheque'
    | 'transaction-invoices'
  >('client-cheque');
  const firstDayOfLastMonth = new Date();
  firstDayOfLastMonth.setMonth(firstDayOfLastMonth.getMonth() - 1);
  firstDayOfLastMonth.setDate(1);
  firstDayOfLastMonth.setHours(0, 0, 0, 0);
  const [dateRange, setDateRange] = useState<any>(
    generateMonthRange(firstDayOfLastMonth, -1),
  );
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [selectedFile, setSelectedFile] = useState<IFile | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isDownloadingBatch, setIsDownloadingBatch] = useState(false);
  const [queryType, setQueryType] = useState<
    'clients' | 'vendors' | 'transactions'
  >('clients');
  const [selectedClient, setSelectedClient] = useState<UserType | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<IVendor | null>(null);
  const [selectedTransactionType, setSelectedTransactionType] =
    useState<any>(null);
  // Fetch all clients
  const { data: clients } = useQuery({
    queryKey: ['clients', companyId],
    queryFn: async () => {
      const response = await axios.get(getAdminApiUrl(companyId, '/clients'));
      return response.data.data;
    },
    initialData: [],
    enabled: !!companyId,
  });

  // Fetch all vendors
  const { data: vendors } = useQuery({
    queryKey: ['vendors', companyId],
    queryFn: async () => {
      const response = await axios.get(getAdminApiUrl(companyId, '/vendors'));
      return response.data.data;
    },
    initialData: [],
    enabled: !!companyId,
  });

  // Fetch all transaction types
  const { data: transactionTypes } = useQuery({
    queryKey: ['transactionTypes', companyId],
    queryFn: async () => {
      const response = await axios.get(
        getAdminApiUrl(companyId, '/expenses/type'),
      );
      return response.data.data;
    },
    initialData: [],
    enabled: !!companyId,
  });

  const { data: files, isLoading: isLoadingFiles } = useQuery({
    queryKey: ['files', companyId, dateRange, activeTab],
    queryFn: async () => {
      if (activeTab === 'client-cheque') {
        const data = await getClientChequeFiles(
          companyId,
          dateRange[0],
          dateRange[1],
        );

        return data;
      } else if (activeTab === 'vendor-cheque') {
        const data = await getVendorChequeFiles(
          companyId,
          dateRange[0],
          dateRange[1],
        );
        return data;
      } else if (activeTab === 'delivery-proof') {
        const data = await getDeliveryProofFiles(dateRange[0], dateRange[1]);
        return data;
      } else if (activeTab === 'invoices') {
        const data = await getInvoices(companyId, dateRange[0], dateRange[1]);
        return data;
      } else if (activeTab === 'transaction-cheque') {
        const data = await getTransactionChequeFiles(
          companyId,
          dateRange[0],
          dateRange[1],
        );
        return data;
      }
      return [];
    },
    initialData: [],
    enabled: !!companyId && !!dateRange[0] && !!dateRange[1],
  });

  const tabs = useMemo(() => {
    if (queryType === 'clients') {
      setActiveTab('client-cheque');
      return clientTabs;
    } else if (queryType === 'vendors') {
      setActiveTab('vendor-cheque');
      return vendorTabs;
    } else if (queryType === 'transactions') {
      setActiveTab('transaction-cheque');
      return transactionTabs;
    }

    return [];
  }, [queryType]);

  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

  const filteredFiles = useMemo(() => {
    if (!files) {
      return [];
    }

    if (files.length === 0) {
      return [];
    }

    // Query by client or vendor
    let queryFiles = files;
    if (queryType === 'clients') {
      if (activeTab === 'delivery-proof') {
        queryFiles = files.filter(
          (file: any) => file.delivery?.order?.userId === selectedClient?.id,
        );
      } else {
        queryFiles = files.filter(
          (file: any) => file.userId === selectedClient?.id,
        );
      }
    } else if (queryType === 'vendors') {
      queryFiles = files.filter(
        (file: any) => file.vendorId === selectedVendor?.id,
      );
    } else if (queryType === 'transactions') {
      if (!selectedTransactionType) {
        return queryFiles;
      }
      if (activeTab === 'transaction-invoices') {
        queryFiles = files.filter(
          (file: any) => file.expense?.typeId === selectedTransactionType?.id,
        );
      } else if (activeTab === 'transaction-cheque') {
        queryFiles = files.filter(
          (file: any) => file.expense?.typeId === selectedTransactionType?.id,
        );
      }
    }

    if (!debouncedSearchQuery || debouncedSearchQuery.trim() === '') {
      return queryFiles;
    }

    // Filter by search query
    if (debouncedSearchQuery && debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      queryFiles = queryFiles.filter((file: any) => {
        if (file.deliveryId && file.deliveryId > 0 && file.delivery) {
          return (
            file.delivery.order?.user?.clientName
              ?.toLowerCase()
              .includes(query) ||
            file.delivery.orderId?.toString().includes(query) ||
            file.createdBy?.toLowerCase().includes(query)
          );
        } else if (file.user) {
          return (
            file.user.clientName?.toLowerCase().includes(query) ||
            file.user.clientId?.toString().includes(query) ||
            file.createdBy?.toLowerCase().includes(query)
          );
        } else if (file.vendor) {
          return (
            file.vendor.name?.toLowerCase().includes(query) ||
            file.vendor.id?.toString().includes(query) ||
            file.createdBy?.toLowerCase().includes(query)
          );
        }
        return false;
      });
    }

    // Sort files by createdAt
    const sortedFiles = queryFiles.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    return sortedFiles;
  }, [
    files,
    debouncedSearchQuery,
    activeTab,
    queryType,
    selectedClient,
    selectedVendor,
  ]);

  // Group files into rows of 4
  const fileRows = useMemo(() => {
    if (!filteredFiles || filteredFiles.length === 0) {
      return [];
    }

    const rows: IFile[][] = [];
    const itemsPerRow = 4;

    for (let i = 0; i < filteredFiles.length; i += itemsPerRow) {
      rows.push(filteredFiles.slice(i, i + itemsPerRow));
    }

    return rows;
  }, [filteredFiles]);

  const handleViewFile = (file: IFile) => {
    setSelectedFile(file);
    setIsViewModalOpen(true);
  };

  const handleDownloadFile = async (file: IFile, isCheque: boolean) => {
    const url = await fetch(
      `/api/admin/${companyId}/files/download?fileId=${file.id}&isCheque=${isCheque}`,
    );
    const data = await url.json();
    window.open(data.url, '_blank');
  };

  const handleToggleFileSelection = (fileId: number, prefix: string) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(`${fileId}-${prefix}`)) {
        newSet.delete(`${fileId}-${prefix}`);
      } else {
        newSet.add(`${fileId}-${prefix}`);
      }
      return newSet;
    });
  };

  const handleChangeTab = (
    tab:
      | 'client-cheque'
      | 'vendor-cheque'
      | 'delivery-proof'
      | 'invoices'
      | 'transaction-cheque'
      | 'transaction-invoices',
  ) => {
    if (selectedFiles.size === 0) {
      setActiveTab(tab);
    } else {
      showNotification(
        'error',
        'Please download or clear the selected files first',
      );
    }
  };

  const handleChangeQueryType = (
    queryType: 'clients' | 'vendors' | 'transactions',
  ) => {
    if (selectedFiles.size === 0) {
      setQueryType(queryType);
    } else {
      showNotification(
        'error',
        'Please download or clear the selected files first',
      );
      return;
    }
  };

  const handleSelectAll = () => {
    const allFileKeys = filteredFiles.map((f: any) => {
      const isCheque = f.evidenceType === EvidenceType.CHEQUE;
      return `${f.id}-${isCheque ? 'cheque' : 'delivery'}`;
    });

    if (selectedFiles.size === allFileKeys.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(allFileKeys));
    }
  };

  const handleClearSelection = () => {
    setSelectedFiles(new Set());
  };

  const handleDownloadBatchFiles = async () => {
    if (selectedFiles.size === 0) return;

    setIsDownloadingBatch(true);
    try {
      const filesToDownload = filteredFiles
        .filter((file: any) => selectedFiles.has(`${file.id}-${activeTab}`))
        .map((file: any) => {
          const isCheque = activeTab.includes('cheque');
          return {
            id: file.id,
            fileKey: isCheque ? file.fileKeyFront : file.fileKey,
            isCheque,
            chequeNumber: file.chequeNumber,
            user: file.user,
            order: file.delivery?.order,
          };
        });

      const response = await fetch(
        `/api/admin/${companyId}/files/download/batch`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ files: filesToDownload }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to download files');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `files-${new Date().getTime()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setSelectedFiles(new Set());
    } catch (error) {
      console.error('Error downloading batch files:', error);
    } finally {
      setIsDownloadingBatch(false);
    }
  };

  return (
    <Sidebar>
      {/* View Modal */}
      {selectedFile && (
        <ViewImg
          fileKeyFront={selectedFile.fileKey}
          fileKeyBack={
            selectedFile.evidenceType === EvidenceType.CHEQUE &&
            selectedFile.note === 'front'
              ? filteredFiles.find(
                  (f: IFile) =>
                    f.expense?.id === selectedFile.expense?.id &&
                    f.note === 'back',
                )?.fileKey
              : undefined
          }
          open={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedFile(null);
          }}
          isCheque={selectedFile.evidenceType === EvidenceType.CHEQUE}
        />
      )}

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header Section */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: neutral[900],
                mb: 1,
              }}
            >
              Company Files
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: neutral[600],
                fontSize: '0.95rem',
              }}
            >
              Manage and view all cheque and delivery proof files
            </Typography>
          </Box>

          <SelectDateRange dateRange={dateRange} setDateRange={setDateRange} />
        </Box>

        {/* Select Client/Vendor Section */}
        <ShadowSection display="flex" flexDirection="column" gap={2} mb={2}>
          <Typography variant="h6" color={blueGrey[800]} sx={{ mb: 1 }}>
            Select {queryType === 'clients' ? 'Client' : 'Vendor'}
          </Typography>
          <Box display="flex" gap={1} alignItems="center">
            <Button
              variant={queryType === 'clients' ? 'contained' : 'outlined'}
              startIcon={<PeopleIcon />}
              onClick={() => handleChangeQueryType('clients')}
            >
              Clients
            </Button>
            <Button
              variant={queryType === 'vendors' ? 'contained' : 'outlined'}
              startIcon={<StoreIcon />}
              onClick={() => handleChangeQueryType('vendors')}
            >
              Vendors
            </Button>
            <Button
              variant={queryType === 'transactions' ? 'contained' : 'outlined'}
              startIcon={<DescriptionIcon />}
              onClick={() => handleChangeQueryType('transactions')}
            >
              Transaction
            </Button>
          </Box>
          {queryType === 'clients' ? (
            <ClientSearch
              clients={clients}
              value={selectedClient}
              onChange={(e, value) => setSelectedClient(value)}
            />
          ) : queryType === 'vendors' ? (
            <VendorSearch
              vendors={vendors || []}
              value={selectedVendor}
              onChange={(e: any, value: IVendor | null) =>
                setSelectedVendor(value)
              }
            />
          ) : queryType === 'transactions' ? (
            <TransactionTypeSearch
              transactionTypes={transactionTypes}
              value={selectedTransactionType}
              onChange={(e, value) => setSelectedTransactionType(value)}
            />
          ) : null}
        </ShadowSection>

        {/* Tabs and Select All Section */}
        <Paper
          elevation={0}
          sx={{
            p: 1,
            mb: 3,
            borderRadius: 2,
            border: `1px solid ${alpha(neutral[300], 0.5)}`,
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <TextField
            fullWidth
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: neutral[500] }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
                backgroundColor: neutral[50],
                '&:hover': {
                  backgroundColor: 'white',
                },
                '&.Mui-focused': {
                  backgroundColor: 'white',
                },
              },
            }}
          />

          <Tabs
            value={activeTab}
            onChange={(e, newValue) => handleChangeTab(newValue as any)}
            variant={mdDown ? 'scrollable' : 'standard'}
            scrollButtons="auto"
            sx={{
              flex: 1,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                minHeight: 40,
                fontSize: '0.9rem',
                color: neutral[600],
                '&.Mui-selected': {
                  color: primary.main,
                },
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
                backgroundColor: primary.main,
              },
            }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                label={tab.label}
                value={tab.value}
                icon={tab.icon}
                iconPosition="start"
              />
            ))}
          </Tabs>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: { xs: 1, md: 2 },
            }}
          >
            <Checkbox
              checked={
                filteredFiles.length > 0 &&
                selectedFiles.size === filteredFiles.length
              }
              indeterminate={
                selectedFiles.size > 0 &&
                selectedFiles.size < filteredFiles.length
              }
              onChange={handleSelectAll}
              sx={{
                color: primary.main,
                '&.Mui-checked': {
                  color: primary.main,
                },
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: neutral[600],
                fontWeight: 500,
                minWidth: { xs: 80, sm: 120 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              }}
            >
              {selectedFiles.size > 0
                ? `${selectedFiles.size} selected`
                : 'Select all'}
            </Typography>
          </Box>
        </Paper>

        {/* File Count Chip */}
        {!isLoadingFiles && filteredFiles.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Chip
              label={`${filteredFiles.length} ${filteredFiles.length === 1 ? 'file' : 'files'}`}
              size="medium"
              sx={{
                backgroundColor: alpha(primary.main, 0.1),
                color: primary.main,
                fontWeight: 500,
                fontSize: '0.75rem',
              }}
            />
          </Box>
        )}

        {/* Files Grid - Virtualized */}
        {isLoadingFiles ? (
          <Grid container spacing={3}>
            {Array.from({ length: 8 }).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={`skeleton-${index}`}>
                <FileCardSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : filteredFiles.length > 0 ? (
          <Box
            sx={{
              height: 'calc(100vh - 500px)',
              minHeight: 600,
            }}
          >
            <Virtuoso
              totalCount={fileRows.length}
              data={fileRows}
              itemContent={(index, row) => {
                // Render file cards row with 4 files per row
                return (
                  <Grid
                    container
                    spacing={3}
                    key={`row-${index}`}
                    sx={{ mb: 3 }}
                  >
                    {row.map((file: IFile | any) => {
                      const isCheque =
                        !!file.render || activeTab.includes('cheque');
                      const prefix = activeTab;
                      const fileKey = `${file.id}-${prefix}`;
                      const isSelected = selectedFiles.has(fileKey);

                      return (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={file.id}>
                          {activeTab === 'delivery-proof' ||
                          activeTab === 'invoices' ||
                          file?.render === 'media' ? (
                            <DeliveryProofOrInvoice
                              file={file}
                              handleViewFile={handleViewFile}
                              handleDownloadFile={(file: IFile) =>
                                handleDownloadFile(file, isCheque)
                              }
                              isSelected={isSelected}
                              onSelect={() =>
                                handleToggleFileSelection(file.id, prefix)
                              }
                              label={
                                activeTab === 'delivery-proof'
                                  ? 'Delivery Proof'
                                  : file?.render === 'media'
                                    ? 'Cheque'
                                    : 'Invoice'
                              }
                            />
                          ) : (
                            <Cheque
                              file={file as any}
                              handleViewFile={handleViewFile}
                              handleDownloadFile={(file: IFile) =>
                                handleDownloadFile(file, isCheque)
                              }
                              isSelected={isSelected}
                              onSelect={() =>
                                handleToggleFileSelection(file.id, prefix)
                              }
                            />
                          )}
                        </Grid>
                      );
                    })}
                  </Grid>
                );
              }}
            />
          </Box>
        ) : (
          <EmptyFiles />
        )}

        {/* Batch Actions Floating Bar */}
        <Slide
          direction="up"
          in={selectedFiles.size > 0}
          mountOnEnter
          unmountOnExit
        >
          <Paper
            elevation={8}
            sx={{
              position: 'fixed',
              bottom: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1300,
              p: 2,
              borderRadius: 3,
              backgroundColor: 'white',
              border: `2px solid ${primary.main}`,
              boxShadow: `0 8px 32px ${alpha(primary.main, 0.3)}`,
              minWidth: { xs: '90%', sm: 400 },
              maxWidth: 600,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: primary.lightest,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckBoxIcon sx={{ color: primary.main, fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, color: neutral[900] }}
                  >
                    {selectedFiles.size} file
                    {selectedFiles.size !== 1 ? 's' : ''} selected
                  </Typography>
                  <Typography variant="caption" sx={{ color: neutral[600] }}>
                    Ready to download
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleClearSelection}
                  sx={{
                    textTransform: 'none',
                    borderColor: neutral[300],
                    color: neutral[700],
                    '&:hover': {
                      borderColor: neutral[400],
                      backgroundColor: neutral[50],
                    },
                  }}
                >
                  Clear
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadBatchFiles}
                  disabled={isDownloadingBatch}
                  sx={{
                    textTransform: 'none',
                    backgroundColor: primary.main,
                    '&:hover': {
                      backgroundColor: primary.dark,
                    },
                  }}
                >
                  {isDownloadingBatch ? 'Downloading...' : 'Download'}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Slide>
      </Box>
      {NotificationComp}
    </Sidebar>
  );
}
