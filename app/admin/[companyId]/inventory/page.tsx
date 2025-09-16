'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useMediaQuery,
  Chip,
  Button,
  alpha,
  Fade,
  Skeleton,
  Tabs,
  Tab,
} from '@mui/material';
import StockItems from '../components/Inventory/StockItems';
import useNotification from '@/hooks/useNotification';
import { SWRFetchData } from '@/app/utils/db';
import { getAdminApiUrl } from '@/app/utils/enum';
// import axios from 'axios';
import {
  Package,
  TrendingUp,
  Clock,
  Plus,
  AlertTriangle,
  AlertCircle,
  BarChart3,
  Warehouse,
} from 'lucide-react';
import TrackInventoryRecord from '../components/Modals/TrackInventoryRecord';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ShadowSection } from '../reports/styled';
import AddInventory from '../components/Modals/add/AddInventory';
import { minThreshold } from '@/app/lib/constant';
import axios from 'axios';
import LoadingButton from '@mui/lab/LoadingButton';
import ConfirmModal from '../components/Modals/ConfirmModal';
import useDebounce from '@/hooks/useDebounce';
import InternalItems from '../components/Inventory/InternalItems';
// Enhanced styled components
const PageContainer = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      minHeight: '100vh',
      p: { xs: 2, md: 3 },
    }}
  >
    {children}
  </Box>
);

const HeaderCard = ({ children }: { children: React.ReactNode }) => (
  <Card
    sx={{
      mb: 3,
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      border: '1px solid',
      borderColor: alpha('#000', 0.06),
      borderRadius: 3,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    }}
  >
    <CardContent sx={{ p: 4 }}>{children}</CardContent>
  </Card>
);

const ActionCard = ({ children }: { children: React.ReactNode }) => (
  <Card
    sx={{
      mb: 3,
      borderRadius: 3,
      border: '1px solid',
      borderColor: alpha('#000', 0.06),
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
      background: '#ffffff',
    }}
  >
    <CardContent sx={{ p: 3 }}>{children}</CardContent>
  </Card>
);

const QuickStatsCard = ({
  icon,
  title,
  value,
  subtitle,
  color = '#3B82F6',
  trend,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  trend?: { value: string; isPositive: boolean };
}) => (
  <Card
    sx={{
      p: 3,
      borderRadius: 3,
      background: `linear-gradient(135deg, ${alpha(color, 0.05)} 0%, ${alpha(color, 0.02)} 100%)`,
      border: `1px solid ${alpha(color, 0.1)}`,
      transition: 'all 0.2s ease',
      boxShadow: 'none',
      cursor: 'pointer',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 8px 25px ${alpha(color, 0.15)}`,
      },
    }}
  >
    <Box display="flex" alignItems="flex-start" justifyContent="space-between">
      <Box>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: alpha(color, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          {React.cloneElement(icon as React.ReactElement, {
            size: 24,
            color: color,
          })}
        </Box>
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{ color: 'text.primary', mb: 0.5 }}
        >
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      {trend && (
        <Chip
          label={trend.value}
          size="small"
          sx={{
            bgcolor: trend.isPositive
              ? alpha('#10B981', 0.1)
              : alpha('#EF4444', 0.1),
            color: trend.isPositive ? '#10B981' : '#EF4444',
            fontWeight: 600,
            fontSize: '0.75rem',
          }}
        />
      )}
    </Box>
  </Card>
);

export default function InventoryPage() {
  const { companyId }: any = useParams();
  const router = useRouter();
  const searchParams: any = useSearchParams();
  const paramsKeywords = searchParams?.get('q');

  const [isTrackingInventory, setIsTrackingInventory] =
    useState<boolean>(false);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState<boolean>(false);
  const [isOpenTrackInventoryRecord, setIsOpenTrackInventoryRecord] =
    useState<boolean>(false);
  const [isOpenAddItem, setIsOpenAddItem] = useState<boolean>(false);
  const [searchKeywords, setSearchKeywords] = useState<string>('');
  const debouncedKeywords = useDebounce(searchKeywords, 1000);
  const [tabIndex, setTabIndex] = useState<number>(0);

  const { showNotification, NotificationComp } = useNotification();
  const [inventoryItems] = SWRFetchData(
    getAdminApiUrl(companyId, '/inventory'),
  );

  const isMobile = useMediaQuery((theme: any) => theme.breakpoints.down('md'));
  const isLoading = !inventoryItems;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (debouncedKeywords) {
      params.set('q', debouncedKeywords);
    } else {
      params.delete('q');
    }

    router.replace(`/admin/${companyId}/inventory?${params.toString()}`, {
      scroll: false,
    });
  }, [debouncedKeywords]);

  useEffect(() => {
    if (paramsKeywords) {
      setSearchKeywords(paramsKeywords);
    }
  }, [paramsKeywords]);

  const getInventoryStats = () => {
    const items = inventoryItems?.data || [];
    const totalItems = items.length;
    const lowStockItems = items.filter(
      (item: any) => item.quantity < minThreshold,
    ).length;
    const outOfStockItems = items.filter(
      (item: any) => item.quantity <= 0,
    ).length;
    const totalValue = items.reduce(
      (sum: number, item: any) => sum + (item?.totalValue || 0),
      0,
    );

    return {
      totalItems,
      lowStockItems,
      outOfStockItems,
      totalValue,
    };
  };

  const handleTrackInventory = async () => {
    try {
      setIsTrackingInventory(true);
      const response = await axios.post(`/api/cron/track-inventory`);

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsTrackingInventory(false);
        return;
      }

      showNotification('success', response.data.message);
      setIsTrackingInventory(false);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', 'Internal Server Error: ' + error);
      setIsTrackingInventory(false);
    }
  };

  const stats = useMemo(() => getInventoryStats(), [inventoryItems]);

  const renderHeader = () => (
    <HeaderCard>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        mb={3}
      >
        <Box>
          <Box display="flex" alignItems="center" gap={2} mb={1}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: alpha('#3B82F6', 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Package size={20} color="#3B82F6" />
            </Box>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              Inventory Management
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Monitor stock levels, track inventory, and manage your warehouse
            efficiently
          </Typography>
        </Box>

        {!isMobile && (
          <Box display="flex" gap={1}>
            <Chip
              label={`${stats.totalItems} Total Items`}
              variant="outlined"
              sx={{ fontWeight: 500 }}
            />
            {stats.lowStockItems > 0 && (
              <Chip
                label={`${stats.lowStockItems} Low Stock`}
                color="warning"
                sx={{ fontWeight: 500 }}
              />
            )}
          </Box>
        )}
      </Box>

      {/* Quick Stats */}
      <Box
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(2, 1fr)',
          md: 'repeat(4, 1fr)',
        }}
        gap={2}
      >
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              height={120}
              sx={{ borderRadius: 3 }}
            />
          ))
        ) : (
          <>
            <QuickStatsCard
              icon={<Package />}
              title="Total Items"
              value={stats.totalItems}
              subtitle="In inventory"
              color="#3B82F6"
            />
            <QuickStatsCard
              icon={<TrendingUp />}
              title="Total Value"
              value={`$${stats.totalValue.toFixed(2)}`}
              subtitle="Current worth"
              color="#10B981"
              // trend={{ value: '+5.2%', isPositive: true }}
            />
            <QuickStatsCard
              icon={<AlertTriangle />}
              title="Low Stock"
              value={stats.lowStockItems}
              subtitle="Need reorder"
              color="#F59E0B"
            />
            <QuickStatsCard
              icon={<AlertCircle />}
              title="Out of Stock"
              value={stats.outOfStockItems}
              subtitle="No stock"
              color="#EF4444"
            />
          </>
        )}
      </Box>
    </HeaderCard>
  );

  const renderActions = () => (
    <ActionCard>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexDirection={isMobile ? 'column' : 'row'}
        gap={2}
      >
        <Box>
          <Typography variant="h6" fontWeight={600} mb={0.5}>
            Inventory Actions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quick actions to manage your inventory
          </Typography>
        </Box>

        <Box display="flex" gap={1} flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={<Clock size={18} />}
            onClick={() => setIsOpenTrackInventoryRecord(true)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            View Records
          </Button>
          <LoadingButton
            loading={isTrackingInventory}
            variant="contained"
            startIcon={<BarChart3 size={18} />}
            onClick={() => setIsOpenConfirmModal(true)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: '#10B981',
              '&:hover': { bgcolor: '#059669' },
            }}
          >
            Check Inventory
          </LoadingButton>
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => router.push(`/admin/${companyId}/inventory/create`)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: '#3B82F6',
              '&:hover': { bgcolor: '#2563EB' },
            }}
          >
            Add Inventory
          </Button>
        </Box>
      </Box>
    </ActionCard>
  );

  const renderTabs = () => (
    <Box sx={{ mb: 3 }}>
      <Tabs
        value={tabIndex}
        onChange={(e, index) => setTabIndex(index)}
        variant={isMobile ? 'fullWidth' : 'standard'}
        sx={{
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '1rem',
            minHeight: 48,
            borderRadius: '12px 12px 0 0',
          },
          '& .Mui-selected': {
            bgcolor: alpha('#3B82F6', 0.08),
          },
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: '3px 3px 0 0',
            bgcolor: '#3B82F6',
          },
        }}
      >
        <Tab
          label="Stock Items"
          value={0}
          icon={<Package size={18} />}
          iconPosition="start"
        />
        <Tab
          label="Internal Items"
          value={1}
          icon={<Warehouse size={18} />}
          iconPosition="start"
        />
      </Tabs>
    </Box>
  );

  const renderContent = () => (
    <ShadowSection>
      {tabIndex === 0 ? (
      <Fade in={true} timeout={300}>
        <Box>
            <StockItems
            showNotification={showNotification}
            inventoryItems={inventoryItems}
            searchKeywords={searchKeywords}
            setSearchKeywords={setSearchKeywords}
            debouncedKeywords={debouncedKeywords || ''}
            />
        </Box>
      </Fade>
      ) : (
        <Fade in={true} timeout={300}>
         <Box>
        <InternalItems
        />
        </Box>
        </Fade>
      )}
    </ShadowSection>
  );

  return (
    <Sidebar overflow="auto" noMargin>
      <AddInventory
        open={isOpenAddItem}
        onClose={() => setIsOpenAddItem(false)}
        showNotification={showNotification}
      />
      <PageContainer>
        {/* Modals */}
        {/* <AddStockPurchased
          open={isOpenAddStockPurchased}
          onClose={() => setIsOpenAddStockPurchased(false)}
          showNotification={showNotification}
        /> */}
        <ConfirmModal
          open={isOpenConfirmModal}
          onClose={() => setIsOpenConfirmModal(false)}
          showNotification={showNotification}
          title="Check Inventory Quantity"
          handleSubmit={handleTrackInventory}
          buttonLabel="Check Now"
        />
        <TrackInventoryRecord
          open={isOpenTrackInventoryRecord}
          onClose={() => setIsOpenTrackInventoryRecord(false)}
        />
        {NotificationComp}

        {/* Main Content */}
        {renderHeader()}
        {renderActions()}
        {renderTabs()}
        {renderContent()}
      </PageContainer>
    </Sidebar>
  );
}
