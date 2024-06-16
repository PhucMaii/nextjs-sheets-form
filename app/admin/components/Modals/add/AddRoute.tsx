import React, { Dispatch, SetStateAction, useState } from 'react';
import { ModalProps } from '../type';
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
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import { Notification, IRoutes, UserType } from '@/app/utils/type';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';

interface PropTypes extends ModalProps {
  day: string;
  driverList: Driver[];
  clientList: UserType[];
  disabledClientList: UserType[];
  setNotification: Dispatch<SetStateAction<Notification>>;
  handleAddRouteUI: (targetRoute: IRoutes) => void;
}

export default function AddRoute({
  open,
  onClose,
  day,
  driverList,
  clientList,
  disabledClientList,
  setNotification,
  handleAddRouteUI,
}: PropTypes) {
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newRoute, setNewRoute] = useState<IRoutes>({
    id: -1,
    name: '',
    driverId: -1,
    day,
  });
  const [selectedClients, setSelectedClients] = useState<UserType[]>([]);

  const addRoute = async () => {
    if (
      newRoute.driverId === -1 ||
      newRoute.name.trim() === '' ||
      selectedClients.length === 0
    ) {
      setNotification({
        on: true,
        type: 'error',
        message: 'Please fill out all blanks',
      });
      return;
    }
    try {
      setIsAdding(true);
      const response = await axios.post(API_URL.ROUTES, {
        day,
        driverId: newRoute.driverId,
        name: newRoute.name,
        clientList: selectedClients,
      });

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        setIsAdding(false);
        return;
      }

      handleAddRouteUI(response.data.data);

      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
      setIsAdding(false);
    } catch (error: any) {
      console.log('There was an error: ', error);
      setNotification({
        on: true,
        type: 'error',
        message: 'There was an error: ' + error,
      });
      setIsAdding(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal
        display="flex"
        flexDirection="column"
        overflow="auto"
        maxHeight="70vh"
        gap={2}
      >
        <ModalHead
          heading="Add Route"
          onClick={addRoute}
          buttonProps={{
            loading: isAdding,
            disabled:
              newRoute.driverId === -1 ||
              newRoute.name.trim() === '' ||
              selectedClients.length === 0,
          }}
          buttonLabel="ADD"
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
              <Typography variant="h6">Clients:</Typography>
              <Autocomplete
                multiple
                options={clientList}
                getOptionDisabled={(option) => {
                  const isOptionInvalid = disabledClientList.some(
                    (client: UserType) => option.id === client.id,
                  );
                  return isOptionInvalid;
                }}
                disableCloseOnSelect
                getOptionLabel={(option: UserType) =>
                  `${option.clientName} - ${option.clientId}`
                }
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Checkbox
                      icon={<CheckBoxOutlineBlankIcon />}
                      checkedIcon={<CheckBoxIcon />}
                      style={{ marginRight: 8 }}
                      checked={selected}
                    />
                    {option.clientName} - {option.clientId}
                  </li>
                )}
                style={{ width: '100%' }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Clients"
                    placeholder="-- Choose clients --"
                  />
                )}
                value={selectedClients}
                onChange={(e, newValue: UserType[]) =>
                  setSelectedClients(newValue)
                }
              />
            </Box>
          </Grid>
        </Grid>
      </BoxModal>
    </Modal>
  );
}
