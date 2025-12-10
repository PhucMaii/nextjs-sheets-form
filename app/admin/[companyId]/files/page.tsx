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
  Menu,
  MenuItem,
  Chip,
  Divider,
  Checkbox,
  Slide,
  Skeleton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Receipt as ReceiptIcon,
  LocalShipping as LocalShippingIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  ArrowDownward as ArrowDownwardIcon,
  Group as GroupIcon,
  Download as DownloadIcon,
  CheckBox as CheckBoxIcon,
} from '@mui/icons-material';
import ViewImg from '../components/ViewImg';
import OverviewCard from '../components/OverviewCard/OverviewCard';
import { primary, neutral, success, info } from '@/theme/color';
import DeliveryProof from '../components/Files/DeliveryProof';
import { IFile } from '@/app/utils/type';
import { EvidenceType } from '@prisma/client';
import EmptyFiles from '../components/Files/EmptyFiles';
import { useQuery } from '@tanstack/react-query';
import useFiles from '@/hooks/db-tables/useFiles';
import { useParams } from 'next/navigation';
import Cheque from '../components/Files/Cheque';
import dayjs from 'dayjs';
import { generateMonthRange } from '@/app/utils/time';
import SelectDateRange from '../components/Select/SelectDateRange';

const tabs = [
  {
    label: 'Client Cheque',
    value: 'client-cheque',
    icon: <ReceiptIcon sx={{ fontSize: 18 }} />,
  },
  {
    label: 'Vendor Cheque',
    value: 'vendor-cheque',
    icon: <ReceiptIcon sx={{ fontSize: 18 }} />,
  },
  {
    label: 'Delivery Proof',
    value: 'delivery-proof',
    icon: <LocalShippingIcon sx={{ fontSize: 18 }} />,
  },
];

export default function FilesPage() {
  const { companyId }: any = useParams();
  const { getClientChequeFiles, getVendorChequeFiles, getDeliveryProofFiles } =
    useFiles();

  const [activeTab, setActiveTab] = useState<
    'client-cheque' | 'vendor-cheque' | 'delivery-proof'
  >('client-cheque');
  const firstDayOfLastMonth = new Date();
  firstDayOfLastMonth.setMonth(firstDayOfLastMonth.getMonth() - 1);
  firstDayOfLastMonth.setDate(1);
  firstDayOfLastMonth.setHours(0, 0, 0, 0);
const [dateRange, setDateRange] = useState<any>(generateMonthRange(firstDayOfLastMonth, -1));
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [selectedFile, setSelectedFile] = useState<IFile | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const isSortMenuOpen = Boolean(sortAnchorEl);
  const [groupBy, setGroupBy] = useState<
    'none' | 'date' | 'customer' | 'vendor'
  >('none');
  const [groupAnchorEl, setGroupAnchorEl] = useState<null | HTMLElement>(null);
  const isGroupMenuOpen = Boolean(groupAnchorEl);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isDownloadingBatch, setIsDownloadingBatch] = useState(false);

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
        const data = await getDeliveryProofFiles(
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

  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

  const filteredFiles = useMemo(() => {
    if (!files) {
      return [];
    }

    if (files.length === 0) {
      return [];
    }

    // Filter by search query
    let queryFiles = files;
    if (debouncedSearchQuery && debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      queryFiles = files.filter((file: any) => {
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
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return sortedFiles;
  }, [files, activeTab, debouncedSearchQuery, sortOrder]);

  const groupedFiles = useMemo(() => {
    if (groupBy === 'none') {
      return { ungrouped: filteredFiles };
    }

    const groups: Record<string, any[]> = {};

    filteredFiles.forEach((file: any) => {
      let groupKey = 'N/A';

      if (groupBy === 'date') {
        const date =
          file.expense?.date || file.delivery?.deliveredAt || file.createdAt;
        if (date) {
          groupKey = dayjs(date).format('MMM DD, YYYY');
        }
      } else if (groupBy === 'customer') {
        if (file.delivery?.order?.user?.clientName) {
          groupKey = file.delivery.order.user.clientName;
        }

        if (file.user?.clientName) {
          groupKey = file.user.clientName;
        }
      } else if (groupBy === 'vendor') {
        if (file?.vendor?.name) {
          groupKey = file?.vendor?.name;
        }
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(file);
    });

    const nonNAGroupKeys = Object.keys(groups).filter((key) => key !== 'N/A');

    // Sort group keys
    const sortedKeys = nonNAGroupKeys.sort((a, b) => {
      if (groupBy === 'date') {
        return dayjs(b).valueOf() - dayjs(a).valueOf();
      }
      return a.localeCompare(b);
    });

    const sortedGroups: Record<string, any[]> = {};
    sortedKeys.forEach((key) => {
      sortedGroups[key] = groups[key];
    });

    return sortedGroups;
  }, [filteredFiles, groupBy]);

  const handleViewFile = (file: IFile) => {
    setSelectedFile(file);
    setIsViewModalOpen(true);
  };

  const handleDownloadFile = async (file: IFile, isCheque: boolean) => {
    const fileKey = isCheque ? file.fileKeyFront : file.fileKey;
    const url = await fetch(
      `/api/admin/${companyId}/files/download?rawKey=${encodeURIComponent(fileKey || '')}&isCheque=${isCheque}&fileId=${file.id}`,
    );
    const data = await url.json();
    window.open(data.url, '_blank');
  };

  const handleToggleFileSelection = (fileId: number, isCheque: boolean) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(`${fileId}-${isCheque ? 'cheque' : 'delivery'}`)) {
        newSet.delete(`${fileId}-${isCheque ? 'cheque' : 'delivery'}`);
      } else {
        newSet.add(`${fileId}-${isCheque ? 'cheque' : 'delivery'}`);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedFiles.size === filteredFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredFiles.map((f: any) => f.id)));
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
        .filter((file: any) =>
          selectedFiles.has(
            `${file.id}-${file.evidenceType === EvidenceType.CHEQUE ? 'cheque' : 'delivery'}`,
          ),
        )
        .map((file: any) => {
          const isCheque = file.evidenceType === EvidenceType.CHEQUE;
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

  const handleSortMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortMenuClose = () => {
    setSortAnchorEl(null);
  };

  const handleSortSelect = (order: 'newest' | 'oldest') => {
    setSortOrder(order);
    handleSortMenuClose();
  };

  const handleGroupMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setGroupAnchorEl(event.currentTarget);
  };

  const handleGroupMenuClose = () => {
    setGroupAnchorEl(null);
  };

  const handleGroupSelect = (
    group: 'none' | 'date' | 'customer' | 'vendor',
  ) => {
    setGroupBy(group);
    handleGroupMenuClose();
  };

  // Flatten grouped files for virtualization
  const flattenedFiles = useMemo(() => {
    if (groupBy === 'none') {
      return filteredFiles.map((file: any, index: number) => ({
        file,
        index,
        isGroupHeader: false,
        groupKey: null,
      }));
    }

    const flattened: Array<{
      file: any;
      index: number;
      isGroupHeader: boolean;
      groupKey: string | null;
      fileCount?: number;
    }> = [];
    let globalIndex = 0;

    Object.entries(groupedFiles).forEach(([groupKey, files]) => {
      flattened.push({
        file: null,
        index: globalIndex++,
        isGroupHeader: true,
        groupKey,
        fileCount: files.length,
      });

      files.forEach((file: any) => {
        flattened.push({
          file,
          index: globalIndex++,
          isGroupHeader: false,
          groupKey,
        });
      });
    });

    return flattened;
  }, [filteredFiles, groupedFiles, groupBy]);

  // Calculate items per row based on screen size
  const itemsPerRow = mdDown ? 1 : 4;

  // Create rows for virtualization
  const rows = useMemo(() => {
    const rowsArray: Array<{
      items: Array<{
        file: any;
        index: number;
        isGroupHeader: boolean;
        groupKey: string | null;
        fileCount?: number;
      }>;
      rowIndex: number;
    }> = [];

    if (groupBy === 'none') {
      // Simple grid layout for ungrouped
      for (let i = 0; i < flattenedFiles.length; i += itemsPerRow) {
        rowsArray.push({
          items: flattenedFiles.slice(i, i + itemsPerRow),
          rowIndex: Math.floor(i / itemsPerRow),
        });
      }
    } else {
      // Grouped layout - keep headers separate
      let currentRow: Array<{
        file: any;
        index: number;
        isGroupHeader: boolean;
        groupKey: string | null;
        fileCount?: number;
      }> = [];

      flattenedFiles.forEach((item: any) => {
        if (item.isGroupHeader) {
          // Start new row for group header
          if (currentRow.length > 0) {
            rowsArray.push({
              items: currentRow,
              rowIndex: rowsArray.length,
            });
            currentRow = [];
          }
          // Group header takes full row
          rowsArray.push({
            items: [item],
            rowIndex: rowsArray.length,
          });
        } else {
          currentRow.push(item);
          if (currentRow.length === itemsPerRow) {
            rowsArray.push({
              items: currentRow,
              rowIndex: rowsArray.length,
            });
            currentRow = [];
          }
        }
      });

      if (currentRow.length > 0) {
        rowsArray.push({
          items: currentRow,
          rowIndex: rowsArray.length,
        });
      }
    }

    return rowsArray;
  }, [flattenedFiles, itemsPerRow, groupBy, mdDown]);

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

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6} lg={4}>
            <OverviewCard
              text="Total Files"
              value={filteredFiles.length}
              icon={
                <FilterListIcon sx={{ color: primary.main, fontSize: 50 }} />
              }
              iconBackground={alpha(primary.main, 0.15)}
              textColor={neutral[900]}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <OverviewCard
              text="Cheque Files"
              value={
                filteredFiles.filter(
                  (file: IFile) => file.evidenceType === EvidenceType.CHEQUE,
                ).length
              }
              icon={<ReceiptIcon sx={{ color: info.main, fontSize: 50 }} />}
              iconBackground={alpha(info.main, 0.15)}
              textColor={neutral[900]}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <OverviewCard
              text="Delivery Proof Files"
              value={
                filteredFiles.filter(
                  (file: IFile) =>
                    file.evidenceType === EvidenceType.DELIVERY_PROOF,
                ).length
              }
              icon={
                <LocalShippingIcon sx={{ color: success.main, fontSize: 50 }} />
              }
              iconBackground={alpha(success.main, 0.15)}
              textColor={neutral[900]}
            />
          </Grid>
        </Grid>

        {/* Search, Sort and Group Section */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 2,
            borderRadius: 2,
            border: `1px solid ${alpha(neutral[300], 0.5)}`,
            backgroundColor: 'white',
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
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
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                startIcon={<SortIcon />}
                endIcon={<ArrowDownwardIcon />}
                onClick={handleSortMenuOpen}
                fullWidth
                sx={{
                  textTransform: 'none',
                  borderColor: neutral[300],
                  color: neutral[700],
                  fontWeight: 500,
                  '&:hover': {
                    borderColor: primary.main,
                    backgroundColor: primary.lightest,
                    color: primary.main,
                  },
                }}
              >
                Sort:{' '}
                {sortOrder === 'newest'
                  ? 'Newest to Oldest'
                  : 'Oldest to Newest'}
              </Button>
              <Menu
                anchorEl={sortAnchorEl}
                open={isSortMenuOpen}
                onClose={handleSortMenuClose}
                MenuListProps={{
                  'aria-labelledby': 'sort-button',
                }}
              >
                <MenuItem
                  onClick={() => handleSortSelect('newest')}
                  selected={sortOrder === 'newest'}
                >
                  Newest to Oldest
                </MenuItem>
                <MenuItem
                  onClick={() => handleSortSelect('oldest')}
                  selected={sortOrder === 'oldest'}
                >
                  Oldest to Newest
                </MenuItem>
              </Menu>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                startIcon={<GroupIcon />}
                endIcon={<ArrowDownwardIcon />}
                onClick={handleGroupMenuOpen}
                fullWidth
                sx={{
                  textTransform: 'none',
                  borderColor: neutral[300],
                  color: neutral[700],
                  fontWeight: 500,
                  '&:hover': {
                    borderColor: primary.main,
                    backgroundColor: primary.lightest,
                    color: primary.main,
                  },
                }}
              >
                Group:{' '}
                {groupBy === 'none'
                  ? 'None'
                  : groupBy === 'date'
                    ? 'Date'
                    : groupBy === 'customer'
                      ? 'Customer'
                      : 'Vendor'}
              </Button>
              <Menu
                anchorEl={groupAnchorEl}
                open={isGroupMenuOpen}
                onClose={handleGroupMenuClose}
                MenuListProps={{
                  'aria-labelledby': 'group-button',
                }}
              >
                <MenuItem
                  onClick={() => handleGroupSelect('none')}
                  selected={groupBy === 'none'}
                >
                  None
                </MenuItem>
                {activeTab === 'delivery-proof' && (
                  <MenuItem
                    onClick={() => handleGroupSelect('date')}
                    selected={groupBy === 'date'}
                  >
                    By Date
                  </MenuItem>
                )}
                <MenuItem
                  onClick={() => handleGroupSelect('customer')}
                  selected={groupBy === 'customer'}
                >
                  By Customer Name
                </MenuItem>
                <MenuItem
                  onClick={() => handleGroupSelect('vendor')}
                  selected={groupBy === 'vendor'}
                >
                  By Vendor Name
                </MenuItem>
              </Menu>
            </Grid>
          </Grid>
        </Paper>

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
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
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
            <SelectDateRange
              dateRange={dateRange}
              setDateRange={setDateRange}
            />
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

        {/* Files Grid - Virtualized */}
        {isLoadingFiles ? (
          <Skeleton variant="rectangular" height={600} />
        ) : filteredFiles.length > 0 ? (
          <Box
            sx={{
              height: 'calc(100vh - 500px)',
              minHeight: 600,
            }}
          >
            <Virtuoso
              totalCount={rows.length}
              data={rows}
              itemContent={(index, row) => {
                const firstItem = row.items[0];

                // Render group header
                if (firstItem.isGroupHeader) {
                  return (
                    <Box
                      key={`header-${firstItem.groupKey}`}
                      sx={{ mb: 2, mt: index > 0 ? 4 : 0 }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mb: 2,
                          gap: 1,
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: neutral[900],
                          }}
                        >
                          {firstItem.groupKey}
                        </Typography>
                        <Chip
                          label={firstItem.fileCount}
                          size="small"
                          sx={{
                            backgroundColor: primary.lightest,
                            color: primary.main,
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                      <Divider />
                    </Box>
                  );
                }

                // Render file cards row
                return (
                  <Grid
                    container
                    spacing={3}
                    key={`row-${row.rowIndex}`}
                    sx={{ mb: 3 }}
                  >
                    {row.items.map((item) => {
                      if (item.isGroupHeader) return null;
                      return (
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={4}
                          lg={3}
                          key={item.file.id}
                        >
                          {item.file.evidenceType ===
                          EvidenceType.DELIVERY_PROOF ? (
                            <DeliveryProof
                              file={item.file}
                              handleViewFile={handleViewFile}
                              handleDownloadFile={(file: IFile) =>
                                handleDownloadFile(file, false)
                              }
                              isSelected={selectedFiles.has(
                                `${item.file.id}-delivery`,
                              )}
                              onSelect={() =>
                                handleToggleFileSelection(item.file.id, false)
                              }
                            />
                          ) : (
                            <Cheque
                              file={item.file}
                              handleViewFile={handleViewFile}
                              handleDownloadFile={(file: IFile) =>
                                handleDownloadFile(file, true)
                              }
                              isSelected={selectedFiles.has(
                                `${item.file.id}-cheque`,
                              )}
                              onSelect={() =>
                                handleToggleFileSelection(item.file.id, true)
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
    </Sidebar>
  );
}
