'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import { Box, Grid, IconButton, TextField, Typography } from '@mui/material';
import { ArrowLeftIcon } from '@mui/x-date-pickers/icons';
import LoadingButton from '@mui/lab/LoadingButton';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import useNotification from '@/hooks/useNotification';
import { fetchApi } from '@/app/utils/db';
import { getAdminApiUrl } from '@/app/utils/enum';
import { ShadowSection } from '../../reports/styled';
import QuoteItemTable from '../../components/Tables/QuoteItemTable';
import ClientSection from '../create/ClientSection';
import useInventoryItems from '@/hooks/autocomplete/useInventoryItems';
import { generateQuoteTotal } from '@/app/utils/quote';

export default function QuoteDetailPage() {
  const { companyId, id } = useParams() as any;
  const [quote, setQuote] = useState<any>(null);

  const router = useRouter();
  const { showNotification, NotificationComp } = useNotification();
  const { setSelectedInventoryItems, renderMultipleInventoryItemSearch } =
    useInventoryItems();

  useEffect(() => {
    fetchQuote();
  }, []);

  useEffect(() => {
    if (quote?.items) {
      const newSelectedInventoryItems = quote?.items.map((item: any) => {
        return {
          ...item,
          id: item.inventoryItemId,
          sku: item.inventoryItem.sku,
          name: item.inventoryItem.name,
          image: item.inventoryItem.image,
          unit: item.unit,
        };
      });
      setSelectedInventoryItems(newSelectedInventoryItems);
    }
  }, [quote]);

  const totalOverview = useMemo(() => {
    if (!quote?.items || quote?.items.length === 0) {
      return {
        subtotal: 0,
        gst: 0,
        pst: 0,
        total: 0,
      };
    }

    return generateQuoteTotal(quote?.items);
  }, [quote?.items]);

  const fetchQuote = async () => {
    try {
      const data = await fetchApi(
        getAdminApiUrl(companyId, `/quotes?quoteId=${id}`),
      );
      setQuote(data);
    } catch (error) {
      console.error('Error fetching quote:', error);
      showNotification('error', 'Error fetching quote: ' + error);
    }
  };

  const handleExportQuote = async () => {
    if (!quote) {
      showNotification('error', 'Please wait for the quote to load');
      return;
    }
    try {
      const response = await fetch('/api/pdf/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quote }),
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${quote.user.name} - ${quote.id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      showNotification('success', 'Quote exported successfully');
    } catch (error) {
      console.error('Error fetching quote:', error);
      showNotification('error', 'Error fetching quote: ' + error);
    }
  };

  const onUpdateItem = useCallback(
    (item: any) => {
      setQuote((prevQuote: any) => ({
        ...prevQuote,
        items: prevQuote?.items.map((i: any) => {
          if (i.id === item.id) {
            return {
              ...item,
              inventoryUnitId: item?.unit?.id || i.inventoryUnitId,
              inventoryUnit: item?.unit || i.inventoryUnit,
              price: item?.price || i.price,
              quantity: item?.quantity || i.quantity,
            };
          }
          return i;
        }),
      }));
    },
    [],
  );

  const onRemoveItem = useCallback(
    (item: any) => {
      setQuote((prevQuote: any) => ({
        ...prevQuote,
        items: prevQuote?.items.filter((i: any) => i.id !== item.id),
      }));
    },
    [],
  );

  return (
    <Sidebar>
      {NotificationComp}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center">
          <IconButton
            onClick={() =>
              router.push(`/admin/${companyId}/quotes?quoteId=${id}`)
            }
          >
            <ArrowLeftIcon />
          </IconButton>
          <Typography variant="h5" fontWeight="semibold">
            Quote Detail
          </Typography>
        </Box>

        <LoadingButton
          variant="contained"
          color="primary"
          onClick={handleExportQuote}
          loading={false}
        >
          Export Quote
        </LoadingButton>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          {/* Item Details */}
          <ShadowSection display="flex" flexDirection="column" gap={2}>
            <Typography variant="body1" fontWeight="semibold">
              Item
            </Typography>
            <Grid container>
              <Grid item xs={12}>
                {renderMultipleInventoryItemSearch()}
              </Grid>
            </Grid>

            <QuoteItemTable
              selectedItems={quote?.items || []}
              onUpdateItem={onUpdateItem}
              onRemoveItem={onRemoveItem}
            />
          </ShadowSection>
        </Grid>

        <Grid
          item
          xs={12}
          md={4}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          {/* Customer Details */}
          <ClientSection selectedClient={quote?.user} />

          <ShadowSection display="flex" flexDirection="column" gap={2}>
            <Typography variant="body1" fontWeight="semibold">
              Total Overview
            </Typography>

            <TextField
              label="Note"
              value={quote?.note || ''}
              onChange={(e) => setQuote({ ...quote, note: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />

            <Grid container spacing={2}>
              <Grid
                item
                xs={12}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="body1" fontWeight="semibold">
                  Total Items
                </Typography>

                <Typography variant="body1">{quote?.items.length}</Typography>
              </Grid>

              <Grid
                item
                xs={12}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="body1" fontWeight="semibold">
                  Subtotal
                </Typography>

                <Typography variant="body1">
                  ${totalOverview?.subtotal?.toFixed(2)}
                </Typography>
              </Grid>

              <Grid
                item
                xs={12}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="body1" fontWeight="semibold">
                  GST
                </Typography>

                <Typography variant="body1">
                  ${totalOverview?.gst?.toFixed(2)}
                </Typography>
              </Grid>

              <Grid
                item
                xs={12}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="body1" fontWeight="semibold">
                  PST
                </Typography>

                <Typography variant="body1">
                  ${totalOverview?.pst?.toFixed(2)}
                </Typography>
              </Grid>

              <Grid
                item
                xs={12}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="body1" fontWeight="semibold">
                  Total
                </Typography>

                <Typography variant="body1">
                  ${totalOverview?.total?.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </ShadowSection>
        </Grid>
      </Grid>
    </Sidebar>
  );
}
