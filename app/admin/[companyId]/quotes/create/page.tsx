'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import {
  Box,
  Grid,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, ClipboardPasteIcon } from 'lucide-react';
import { ShadowSection } from '../../reports/styled';
import QuoteItemTable from '../../components/Tables/QuoteItemTable';
import useInventoryItems from '@/hooks/autocomplete/useInventoryItems';
import PasteCategory from '../../components/Modals/PasteCategory';
import useClients from '@/hooks/autocomplete/useClients';
import { generateQuoteTotal } from '@/app/utils/quote';
import useNotification from '@/hooks/useNotification';
import axios from 'axios';
import { getAdminApiUrl, QUOTE_STATUS } from '@/app/utils/enum';
import ClientSection from './ClientSection';
import { LoadingButton } from '@mui/lab';
import { useParams } from 'next/navigation';

export default function CreateQuotePage() {
  const { companyId }: any = useParams();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [address, setAddress] = useState<any>(null);
  const [client, setClient] = useState<any>({
    clientId: '',
    clientName: '',
    email: '',
    contactNumber: '',
    deliveryAddress: '',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [note, setNote] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [isOpenPasteCategory, setIsOpenPasteCategory] =
    useState<boolean>(false);

  const router = useRouter();

  const totalOverview = useMemo(() => {
    if (selectedItems.length === 0) {
      return {
        subtotal: 0,
        gst: 0,
        pst: 0,
        total: 0,
      };
    }

    return generateQuoteTotal(selectedItems);
  }, [selectedItems]);

  const {
    inventoryItems,
    selectedInventoryItems,
    renderMultipleInventoryItemSearch,
    setSelectedInventoryItems,
  } = useInventoryItems();

  const { renderClientSearch, selectedClient, setSelectedClient } =
    useClients();

  console.log('re render page');

  const { showNotification, NotificationComp } = useNotification();

  useEffect(() => {
    const newSelectedItems = selectedInventoryItems.map((item) => {
      const isExistInSelected = selectedItems.find(
        (selectedItem) => selectedItem.id === item.id,
      );
      if (isExistInSelected) {
        return isExistInSelected;
      }

      return {
        ...item,
        quantity: 1,
        price: 0,
      };
    });
    setSelectedItems(newSelectedItems);
  }, [selectedInventoryItems]);

  useEffect(() => {
    if (selectedClient) {
      setClient(selectedClient);
    }
  }, [selectedClient]);

  const onPasteCategory = (category: any) => {
    const newSelectedItems = category.items
      .map((item: any) => {
        const inventoryItem = inventoryItems.find(
          (inventoryItem: any) => inventoryItem.id === item.inventoryItemId,
        );
        if (!inventoryItem) {
          return null;
        }

        const units = inventoryItem.vendorItem.flatMap(
          (item: any) => item.unit,
        );
        const uniqueUnits = Array.from(
          new Map(units.map((unit: any) => [unit.ratio, unit])).values(),
        );

        console.log({ item: item?.inventoryUnit, units: uniqueUnits });
        return {
          ...inventoryItem,
          units: uniqueUnits,
          unit: item.inventoryUnit,
          price: item.price,
          quantity: 1,
        };
      })
      .filter((item: any) => item !== null);

    const newSelectedInventoryItems = newSelectedItems.map((item: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { price, ...restOfItem } = item;

      return restOfItem;
    });
    setSelectedItems(newSelectedItems);
    setSelectedInventoryItems(newSelectedInventoryItems);
  };

  const onUpdateItem = useCallback(
    (item: any) => {
      const newSelectedItems = selectedItems.map((selectedItem) => {
        if (selectedItem.id === item.id) {
          return item;
        }

        return selectedItem;
      });

      setSelectedItems(newSelectedItems);
    },
    [selectedItems],
  );

  const onRemoveItem = useCallback(
    (item: any) => {
      const newSelectedItems = selectedInventoryItems.filter(
        (selectedItem) => selectedItem.id !== item.id,
      );
      setSelectedInventoryItems(newSelectedItems);
    },
    [selectedInventoryItems],
  );

  const onResetNewCustomer = () => {
    setClient({
      clientId: '',
      clientName: '',
      email: '',
      contactNumber: '',
      deliveryAddress: '',
    });
    setSelectedClient(null);
  };

  const handleCreateQuote = async () => {
    setIsLoading(true);
    try {
      const quoteItems = selectedItems.map((item) => {
        return {
          ...item,
          inventoryItemId: item.id,
          inventoryUnitId: item.unit.id,
        };
      });
      const response = await axios.post(getAdminApiUrl(companyId, '/quotes'), {
        quote: {
          status: QUOTE_STATUS.SENT,
          note,
        },
        quoteItems,
        user: client,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', 'Quote created successfully');

      // TODO: Redirect to the quote page
      setTimeout(() => {
        router.push(`/admin/${companyId}/quotes`);
      }, 1000);
    } catch (error: any) {
      console.log('Something went wrong: ', error);
      showNotification(
        'error',
        error?.response?.data?.error || 'Something went wrong',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sidebar>
      {NotificationComp}
      <PasteCategory
        open={isOpenPasteCategory}
        onClose={() => setIsOpenPasteCategory(false)}
        onPaste={onPasteCategory}
      />
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center">
          <IconButton onClick={() => router.push(`/admin/${companyId}/quotes`)}>
            <ArrowLeftIcon />
          </IconButton>
          <Typography variant="h5" fontWeight="semibold">
            Create Quote
          </Typography>
        </Box>

        <LoadingButton
          variant="contained"
          color="primary"
          onClick={handleCreateQuote}
          loading={isLoading}
        >
          + Create Draft
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
              <Grid item xs={11} md={11.5}>
                {renderMultipleInventoryItemSearch()}
              </Grid>
              <Grid item xs={1} md={0.5}>
                <IconButton onClick={() => setIsOpenPasteCategory(true)}>
                  <ClipboardPasteIcon />
                </IconButton>
              </Grid>
            </Grid>

            <QuoteItemTable
              selectedItems={selectedItems}
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
          <ClientSection
            selectedClient={selectedClient}
            client={client}
            setClient={setClient}
            setAddress={setAddress}
            renderClientSearch={renderClientSearch}
            onResetNewCustomer={onResetNewCustomer}
            setSelectedClient={setSelectedClient}
          />
          {/* <ShadowSection display="flex" flexDirection="column" gap={2}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="body1" fontWeight="semibold">
                Customer
              </Typography>
              {selectedClient && (
                <Button color="primary" onClick={onResetNewCustomer}>
                  New Customer
                </Button>
              )}
            </Box>

            {renderClientSearch()}

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Typography variant="body1" fontWeight="semibold">
                    Client Id
                  </Typography>
                  {selectedClient ? (
                    <Typography variant="body1">
                      {selectedClient.clientId}
                    </Typography>
                  ) : (
                    <TextField
                      label="Client Id"
                      value={client?.clientId}
                      onChange={(e) => {
                        setClient({
                          ...client,
                          clientId: e.target.value,
                        });
                      }}
                    />
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Typography variant="body1" fontWeight="semibold">
                    Client Name
                  </Typography>
                  {selectedClient ? (
                    <Typography variant="body1">
                      {selectedClient.clientName}
                    </Typography>
                  ) : (
                    <TextField
                      label="Client Name"
                      value={client?.clientName}
                      onChange={(e) => {
                        setClient({
                          ...client,
                          clientName: e.target.value,
                        });
                      }}
                    />
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Typography variant="body1" fontWeight="semibold">
                    Email
                  </Typography>
                  {selectedClient ? (
                    <Typography variant="body1">
                      {selectedClient?.email || 'N/A'}
                    </Typography>
                  ) : (
                    <TextField
                      label="Email"
                      value={client?.email}
                      onChange={(e) => {
                        setClient({
                          ...client,
                          email: e.target.value,
                        });
                      }}
                    />
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Typography variant="body1" fontWeight="semibold">
                    Contact Number
                  </Typography>
                  {selectedClient ? (
                    <Typography variant="body1">
                      {selectedClient?.contactNumber || 'N/A'}
                    </Typography>
                  ) : (
                    <TextField
                      label="Contact Number"
                      value={client?.contactNumber}
                      onChange={(e) => {
                        setClient({
                          ...client,
                          contactNumber: e.target.value,
                        });
                      }}
                    />
                  )}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Typography variant="body1" fontWeight="semibold">
                    Address
                  </Typography>
                  {selectedClient ? (
                    <Typography variant="body1">
                      {selectedClient?.deliveryAddress || 'N/A'}
                    </Typography>
                  ) : (
                    <AutoCompleteAddress
                      onDataReceived={(data) => {
                        setAddress(data);
                      }}
                    />
                  )}
                </Box>
              </Grid>
            </Grid>
          </ShadowSection> */}

          <ShadowSection display="flex" flexDirection="column" gap={2}>
            <Typography variant="body1" fontWeight="semibold">
              Total Overview
            </Typography>

            <TextField
              label="Note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
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

                <Typography variant="body1">{selectedItems.length}</Typography>
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
