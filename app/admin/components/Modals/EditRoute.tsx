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
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { ModalProps } from './type';
import { BoxModal } from './styled';
import ModalHead from '@/app/lib/ModalHead';
import { infoColor } from '@/app/theme/color';
import { Driver } from '@prisma/client';
import { IUserRoutes, Notification, IRoutes, UserType } from '@/app/utils/type';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';

interface IEditRouteModal extends ModalProps {
  route: IRoutes;
  driverList: Driver[];
  clientList: UserType[];
  day: string;
  setNotification: Dispatch<SetStateAction<Notification>>;
  handleUpdateRouteUI: (targetRoute: IRoutes) => void;
}

const convertFromUserRouteToUser = (clientList: IUserRoutes[]) => {
  const formattedClients = clientList.map((userRoute: IUserRoutes) => {
    return userRoute.user;
  });

  return formattedClients;
};

export default function EditRoute({
  open,
  onClose,
  route,
  driverList,
  clientList,
  day,
  setNotification,
  handleUpdateRouteUI,
}: IEditRouteModal) {
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updatedRoute, setUpdatedRoute] = useState<IRoutes>(route);
  const [selectedClients, setSelectedClients] = useState<UserType[]>(() => {
    if (route.clients) {
      const formattedClients = convertFromUserRouteToUser(route.clients);
      return formattedClients;
    }
    return [];
  });

  useEffect(() => {
    setUpdatedRoute(route);

    if (route.clients) {
      const formattedClients = convertFromUserRouteToUser(route.clients);
      setSelectedClients(formattedClients);
    } else {
      setSelectedClients([]);
    }
  }, [route]);

  const updateRoute = async () => {
    if (updatedRoute.name.trim() === '' || updatedRoute.driverId === -1) {
      setNotification({
        on: true,
        type: 'error',
        message: 'Invalid name or driver',
      });
      return;
    }
    try {
      setIsUpdating(true);
      const updatedValue: any = {};
      if (updatedRoute.name !== route.name) {
        updatedValue.name = updatedRoute.name;
      }

      if (updatedRoute.driverId !== route.driverId) {
        updatedValue.driverId = updatedRoute.driverId;
      }
      const response = await axios.put(API_URL.ROUTES, {
        routeId: route.id,
        ...updatedValue,
        updatedClients: selectedClients,
        day,
      });

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        setIsUpdating(false);
        return;
      }

      handleUpdateRouteUI(response.data.data);

      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
      setIsUpdating(false);
    } catch (error: any) {
      console.log('There was an error: ', error);
      setNotification({
        on: true,
        type: 'error',
        message: 'There was an error: ' + error.response.data.error,
      });
      setIsUpdating(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal display="flex" flexDirection="column" gap={2}>
        <ModalHead
          heading="Edit Route"
          onClick={updateRoute}
          buttonProps={{
            color: infoColor,
            variant: 'contained',
            loading: isUpdating,
          }}
          buttonLabel="EDIT"
        />
        <Divider />
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="h6">Route Name:</Typography>
              <TextField
                label="Route Name"
                value={updatedRoute.name}
                onChange={(e) =>
                  setUpdatedRoute({ ...updatedRoute, name: e.target.value })
                }
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="h6">Driver:</Typography>
              <Select
                value={updatedRoute.driverId}
                onChange={(e) =>
                  setUpdatedRoute({
                    ...updatedRoute,
                    driverId: +e.target.value,
                  })
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
