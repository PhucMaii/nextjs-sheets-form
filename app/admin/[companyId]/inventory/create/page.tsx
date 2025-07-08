'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import {
  Button,
  Box,
  Divider,
  Grid,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
  OutlinedInput,
} from '@mui/material';
import { ShadowSection } from '../../reports/styled';
import { useQuery } from '@tanstack/react-query';
import { getAdminApiUrl } from '@/app/utils/enum';
import { useParams } from 'next/navigation';
import axios from 'axios';
import VendorSelection from '../../components/Modals/Selection/VendorSelection';
import { IVendor } from '@/app/utils/type';

const CreateInventory = () => {
  const { companyId }: any = useParams();

  const { data: itemTypes } = useQuery({
    queryKey: ['itemTypes'],
    queryFn: async () => {
      const response = await axios.get(
        getAdminApiUrl(companyId, '/item-types'),
      );
      return response.data.data;
    },
  });

  const [newInventoryItem, setNewInventoryItem] = useState<any>({
    name: '',
    sku: '',
    typeId: -1,
  });

  const [isOpenVendorSelection, setIsOpenVendorSelection] = useState(false);
  const [selectedVendors, setSelectedVendors] = useState<any[]>([]);
  // const [units, setUnits] = useState<any[]>([]);

  const handleOnSelectVendors = (vendors: any[]) => {
    const vendorsWithUnits = vendors.map((vendor) => {
      if (!vendor.units || vendor.units.length === 0) {
        return {
          ...vendor,
          units: [{ unit: 'bags', ratio: 1, price: 0 }],
        };
      }
      return vendor;
    });
    setSelectedVendors(vendorsWithUnits);
  };

  return (
    <Sidebar>
      <VendorSelection
        open={isOpenVendorSelection}
        onClose={() => setIsOpenVendorSelection(false)}
        selectedVendors={selectedVendors}
        setSelectedVendors={setSelectedVendors}
        fnOnSelect={handleOnSelectVendors}
      />
      <Typography variant="h5">Create Inventory</Typography>

      {/* General Information */}
      <ShadowSection>
        <Grid container spacing={2}>
          <Grid
            item
            xs={12}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Typography fontWeight={600}>Tax</Typography>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap={1}
            >
              <Typography>GST (5%)</Typography>
              <Switch
                checked={newInventoryItem.hasGST}
                onChange={(e) =>
                  setNewInventoryItem((prev: any) => ({
                    ...prev,
                    hasGST: e.target.checked,
                  }))
                }
              />
            </Box>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap={1}
            >
              <Typography>PST (7%)</Typography>
              <Switch
                checked={newInventoryItem.hasPST}
                onChange={(e) =>
                  setNewInventoryItem((prev: any) => ({
                    ...prev,
                    hasPST: e.target.checked,
                  }))
                }
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>
          <Grid
            item
            xs={6}
            sm={8}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Typography fontWeight={600}>Name</Typography>
            <TextField
              label="Name"
              fullWidth
              value={newInventoryItem.name}
              onChange={(e) =>
                setNewInventoryItem((prev: any) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
          </Grid>
          <Grid
            item
            xs={6}
            sm={4}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Typography fontWeight={600}>SKU</Typography>
            <TextField
              label="SKU"
              fullWidth
              value={newInventoryItem.sku}
              onChange={(e) =>
                setNewInventoryItem((prev: any) => ({
                  ...prev,
                  sku: e.target.value,
                }))
              }
            />
          </Grid>
          <Grid
            item
            xs={12}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Typography fontWeight={600}>Type</Typography>
            <Select
              onChange={(e) =>
                setNewInventoryItem({
                  ...newInventoryItem,
                  typeId: +e.target.value,
                })
              }
              fullWidth
              value={newInventoryItem.typeId}
            >
              <MenuItem value={-1} disabled>
                -- Choose type --
              </MenuItem>
              {itemTypes &&
                itemTypes.map((type: any) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
            </Select>
          </Grid>
        </Grid>
      </ShadowSection>

      {/* Vendor and Units */}
      <ShadowSection>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography fontWeight={600}>Vendors</Typography>
          <Button
            color="primary"
            onClick={() => setIsOpenVendorSelection(true)}
          >
            + Add Vendor
          </Button>
        </Box>

        {/* Vendor Items */}
        <Box>
          {selectedVendors.map((vendor) => (
            <Box key={vendor.id}>
              <Typography>{vendor.name}</Typography>
              <Box>
                {vendor?.units && vendor?.units.map((unit: any, index: number) => (
                  <Grid container key={unit.id} alignItems="center" spacing={2} sx={{ my: 1 }}>
                    <Grid item xs={12} md={4}>
                      <OutlinedInput label="Unit" value={unit.unit} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <OutlinedInput label="Ratio" value={unit.ratio} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <OutlinedInput label="Price" value={unit.price} />
                    </Grid>
                  </Grid>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </ShadowSection>
    </Sidebar>
  );
};

export default CreateInventory;
