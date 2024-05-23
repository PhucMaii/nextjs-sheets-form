import React, { useState } from 'react';
import { ModalProps } from './type';
import { Driver } from '@prisma/client';
import {
    Autocomplete,
  Box,
  Divider,
  Grid,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
  Checkbox,
} from '@mui/material';
import { BoxModal } from './styled';
import { infoColor } from '@/app/theme/color';
import ModalHead from '@/app/lib/ModalHead';
import { Routes, UserType } from '@/app/utils/type';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';


interface IAddRouteModal extends ModalProps {
  day: string;
  driverList: Driver[];
  clientList: UserType[];
}

export default function AddRoute({
  open,
  onClose,
  day,
  driverList,
  clientList,
}: IAddRouteModal) {
  const [newRoute, setNewRoute] = useState<Routes>({
    id: -1,
    name: '',
    driverId: -1,
    day,
  });
  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal display="flex" flexDirection="column" gap={2}>
        <ModalHead
          heading="Add Route"
          onClick={() => {}}
          buttonProps={{ color: infoColor, variant: 'contained' }}
        />
        <Divider />
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="h6">Route Name:</Typography>
              <TextField
                label="Route Name"
                value={newRoute.name}
                onChange={(e) =>
                  setNewRoute({ ...newRoute, name: e.target.value })
                }
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="h6">Driver:</Typography>
              <Select
                value={newRoute.driverId}
                onChange={(e) =>
                  setNewRoute({ ...newRoute, driverId: +e.target.value })
                }
              >
                <MenuItem value={-1}>-- Choose a driver --</MenuItem>
                {driverList &&
                  driverList.map((driver: Driver) => {
                    return (
                      <MenuItem key={driver.id} value={driver.id}>
                        {driver.name}
                      </MenuItem>
                    );
                  })}
              </Select>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="h6">Driver:</Typography>
              <Autocomplete 
                multiple
                options={clientList}
                disableCloseOnSelect
                getOptionLabel={(option: UserType) => `${option.clientName} - ${option.clientId}`}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Checkbox 
                      icon={<CheckBoxOutlineBlankIcon />}
                      checkedIcon={<CheckBoxIcon />}
                      style={{marginRight: 8}}
                      checked={selected}
                    />
                    {option.clientName} - {option.clientId}
                  </li>
                )}
                style={{width: '100%'}}
                renderInput={(params) => (
                  <TextField {...params} label="Clients" placeholder="-- Choose clients --" />
                )}
              />
            </Box>
          </Grid>
        </Grid>
      </BoxModal>
    </Modal>
  );
}
