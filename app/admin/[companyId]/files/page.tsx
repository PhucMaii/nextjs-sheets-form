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
} from '@mui/material';
import {
  Search as SearchIcon,
  Receipt as ReceiptIcon,
  LocalShipping as LocalShippingIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  ArrowDownward as ArrowDownwardIcon,
  Group as GroupIcon,
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

const tabs = [
  {
    label: 'All',
    value: 'all',
    icon: <FilterListIcon sx={{ fontSize: 18 }} />,
  },
  {
    label: 'Cheque',
    value: 'cheque',
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
  const { getAllFiles } = useFiles();

  const [activeTab, setActiveTab] = useState<
    'all' | 'cheque' | 'delivery-proof'
  >('all');
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

  const { data: allFiles } = useQuery({
    queryKey: ['files', companyId],
    queryFn: () => getAllFiles(companyId),
    initialData: {
      deliveryProofFiles: [],
      chequeFiles: [],
    },
  });

  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

  const filteredFiles = useMemo(() => {
    if (!allFiles) {
      return [];
    }

    let chequesAndProofs = [
      ...allFiles.deliveryProofFiles,
      ...allFiles.chequeFiles,
    ];

    if (chequesAndProofs.length === 0) {
      return [];
    }

    // Filter by tab
    if (activeTab === 'cheque') {
      chequesAndProofs = chequesAndProofs.filter(
        (file: any) => !file.deliveryId || file.deliveryId === 0,
      );
    } else if (activeTab === 'delivery-proof') {
      chequesAndProofs = chequesAndProofs.filter(
        (file: any) => file.deliveryId && file.deliveryId > 0,
      );
    }

    // Filter by search query
    if (debouncedSearchQuery && debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      chequesAndProofs = chequesAndProofs.filter((file: any) => {
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

    // Map files with evidenceType
    let files = chequesAndProofs.map((file: any) => {
      return {
        ...file,
        evidenceType:
          file.deliveryId > 0
            ? EvidenceType.DELIVERY_PROOF
            : EvidenceType.CHEQUE,
      };
    });

    // Sort files by createdAt
    files = files.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return files;
  }, [allFiles, activeTab, debouncedSearchQuery, sortOrder]);

  const groupedFiles = useMemo(() => {
    if (groupBy === 'none') {
      return { ungrouped: filteredFiles };
    }

    const groups: Record<string, any[]> = {};

    filteredFiles.forEach((file: any) => {
      let groupKey = 'Unknown';

      if (groupBy === 'date') {
        const date =
          file.expense?.date || file.delivery?.deliveredAt || file.createdAt;
        if (date) {
          groupKey = dayjs(date).format('MMM DD, YYYY');
        } else {
          groupKey = 'No Date';
        }
      } else if (groupBy === 'customer') {
        if (file.delivery?.order?.user?.clientName) {
          groupKey = file.delivery.order.user.clientName;
        } else {
          groupKey = 'No Customer';
        }
      } else if (groupBy === 'vendor') {
        if (file.expense?.vendor?.name) {
          groupKey = file.expense.vendor.name;
        } else {
          groupKey = 'No Vendor';
        }
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(file);
    });

    // Sort group keys
    const sortedKeys = Object.keys(groups).sort((a, b) => {
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

  const handleDownloadFile = (file: IFile) => {
    console.log('Downloading file:', file.fileKey);
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

      flattenedFiles.forEach((item) => {
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
                <MenuItem
                  onClick={() => handleGroupSelect('date')}
                  selected={groupBy === 'date'}
                >
                  By Date
                </MenuItem>
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

        {/* Tabs Section */}
        <Paper
          elevation={0}
          sx={{
            p: 1,
            mb: 3,
            borderRadius: 2,
            border: `1px solid ${alpha(neutral[300], 0.5)}`,
            backgroundColor: 'white',
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant={mdDown ? 'scrollable' : 'standard'}
            scrollButtons="auto"
            sx={{
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
        </Paper>

        {/* Files Grid - Virtualized */}
        {filteredFiles.length > 0 ? (
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
                              handleDownloadFile={handleDownloadFile}
                            />
                          ) : (
                            <Cheque
                              file={item.file}
                              handleViewFile={handleViewFile}
                              handleDownloadFile={handleDownloadFile}
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
      </Box>
    </Sidebar>
  );
}
