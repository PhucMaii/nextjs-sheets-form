'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import {
  Box,
  Button,
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
import AutoCompleteAddress from '../../components/AutoCompleteAddress';

export default function CreateQuotePage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [address, setAddress] = useState<any>(null);
  const [client, setClient] = useState<any>({
    clientId: '',
    clientName: '',
    email: '',
    contactNumber: '',
    deliveryAddress: '',
  });
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [isOpenPasteCategory, setIsOpenPasteCategory] =
    useState<boolean>(false);

  const router = useRouter();

  const totalOverview = useMemo(() => {
    const total = selectedItems.reduce((acc, item) => {
      if (!acc.subtotal) {
        acc.subtotal = 0;
      }

      if (!acc.pst) {
        acc.pst = 0;
      }

      if (!acc.gst) {
        acc.gst = 0;
      }

      if (!acc.total) {
        acc.total = 0;
      }

      acc.subtotal += item.price * item.quantity;

      if (item?.isPST) {
        acc.pst += item.price * item.quantity * 0.15;
      }

      if (item?.isGST) {
        acc.gst += item.price * item.quantity * 0.15;
      }

      acc.total = acc.subtotal + acc.pst + acc.gst;

      return acc;
    }, {});

    return total;
  }, [selectedItems]);

  const {
    inventoryItems,
    selectedInventoryItems,
    renderMultipleInventoryItemSearch,
    setSelectedInventoryItems,
  } = useInventoryItems();

  const { renderClientSearch, selectedClient, setSelectedClient } =
    useClients();

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

        return {
          ...inventoryItem,
          price: item.price,
          quantity: 1,
        };
      })
      .filter((item: any) => item !== null);

    const newSelectedInventoryItems = newSelectedItems.map((item: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {price, ...restOfItem}= item;

      return restOfItem;
    });
    setSelectedItems(newSelectedItems);
    setSelectedInventoryItems(newSelectedInventoryItems);

  };

  const onUpdateItem = (item: any) => {
    const newSelectedItems = selectedItems.map((selectedItem) => {
      if (selectedItem.id === item.id) {
        return item;
      }

      return selectedItem;
    });

    setSelectedItems(newSelectedItems);
  };

  const onRemoveItem = (item: any) => {
    const newSelectedItems = selectedInventoryItems.filter(
      (selectedItem) => selectedItem.id !== item.id,
    );
    setSelectedInventoryItems(newSelectedItems);
  };

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

  return (
    <Sidebar>
      <PasteCategory
        open={isOpenPasteCategory}
        onClose={() => setIsOpenPasteCategory(false)}
        onPaste={onPasteCategory}
      />
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center">
          <IconButton onClick={() => router.push('/admin/quotes')}>
            <ArrowLeftIcon />
          </IconButton>
          <Typography variant="h5" fontWeight="semibold">
            Create Quote
          </Typography>
        </Box>

        <Button variant="contained" color="primary">
          + Create Draft
        </Button>
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
          <ShadowSection display="flex" flexDirection="column" gap={2}>
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
          </ShadowSection>

          <ShadowSection display="flex" flexDirection="column" gap={2}>
            <Typography variant="body1" fontWeight="semibold">
              Total Overview
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body1" fontWeight="semibold">
                  Total Items
                </Typography>

                <Typography variant="body1">
                  {selectedItems.length}
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
                  Subtotal
                </Typography>

                <Typography variant="body1">
                  {totalOverview.subtotal}
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

                <Typography variant="body1">{totalOverview.gst}</Typography>
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

                <Typography variant="body1">{totalOverview.pst}</Typography>
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

                <Typography variant="body1">{totalOverview.total}</Typography>
              </Grid>
            </Grid>
          </ShadowSection>
        </Grid>
      </Grid>
    </Sidebar>
  );
}
