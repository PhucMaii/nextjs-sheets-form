'use client';
import React, { useState, useMemo } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
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
} from '@mui/material';
import {
  Search as SearchIcon,
  Receipt as ReceiptIcon,
  LocalShipping as LocalShippingIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import ViewImg from '../components/ViewImg';
import OverviewCard from '../components/OverviewCard/OverviewCard';
import { primary, neutral, success, info } from '@/theme/color';
import FileCard from '../components/Files/FileCard';
import { IFile } from '@/app/utils/type';
import { EvidenceType } from '@prisma/client';
import EmptyFiles from '../components/Files/EmptyFiles';
import { useQuery } from '@tanstack/react-query';
import useFiles from '@/hooks/db-tables/useFiles';
import { useParams } from 'next/navigation';

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
  const [selectedFile, setSelectedFile] = useState<IFile | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const isSortMenuOpen = Boolean(sortAnchorEl);

  const { data: allFiles, isLoading } = useQuery({
    queryKey: ['files', companyId],
    queryFn: () => getAllFiles(companyId),
    initialData: [],
  });

  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));


  const filteredFiles = useMemo(() => {
    let files: IFile[] = allFiles;

    if (activeTab === 'cheque') {
      files = files.filter((file) => file.evidenceType === EvidenceType.CHEQUE);
    } else if (activeTab === 'delivery-proof') {
      files = files.filter(
        (file) => file.evidenceType === EvidenceType.DELIVERY_PROOF,
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      files = files.filter((file) => {
        if (file.evidenceType === EvidenceType.CHEQUE && file.expense) {
          return (
            file.expense.description.toLowerCase().includes(query) ||
            file.expense.amount.toString().includes(query) ||
            file.createdBy.toLowerCase().includes(query)
          );
        } else if (
          file.evidenceType === EvidenceType.DELIVERY_PROOF &&
          file.delivery
        ) {
          return (
            file.delivery.order?.user?.name.toLowerCase().includes(query) ||
            file.delivery.orderId.toString().includes(query) ||
            file.createdBy.toLowerCase().includes(query)
          );
        }
        return false;
      });
    }

    // Sort files by createdAt
    files = [...files].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return files;
  }, [allFiles, activeTab, searchQuery, sortOrder]);

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

  return (
    <Sidebar>
      {/* View Modal */}
      {selectedFile && (
        <ViewImg
          fileKeyFront={selectedFile.fileKey}
          fileKeyBack={
            selectedFile.evidenceType === EvidenceType.CHEQUE &&
            selectedFile.note === 'front'
              ? allFiles.find(
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
              value={allFiles.length}
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
                allFiles.filter(
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
                allFiles.filter(
                  (file: IFile) => file.evidenceType === EvidenceType.DELIVERY_PROOF,
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

        {/* Search and Sort Section */}
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
            <Grid item xs={12} md={8}>
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
            <Grid item xs={12} md={4}>
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
                Sort: {sortOrder === 'newest' ? 'Newest to Oldest' : 'Oldest to Newest'}
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

        {/* Files Grid */}
        {filteredFiles.length > 0 ? (
          <Grid container spacing={3}>
            {filteredFiles.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                isCheque={file.evidenceType === EvidenceType.CHEQUE}
                handleViewFile={handleViewFile}
                handleDownloadFile={handleDownloadFile}
              />
            ))}
          </Grid>
        ) : (
          <EmptyFiles />
        )}
      </Box>
    </Sidebar>
  );
}
