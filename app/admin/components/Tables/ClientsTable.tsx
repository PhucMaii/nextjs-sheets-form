'use clients';
import {
  Box,
  Checkbox,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React, { Dispatch, SetStateAction } from 'react';
import StatusText from '../StatusText';
import { API_URL } from '@/app/utils/enum';
import { Notification, UserType } from '@/app/utils/type';
import useWindowDimensions from '@/hooks/useWindowDimensions';
import { TableComponents, TableVirtuoso } from 'react-virtuoso';
import { orderTypes, paymentTypes } from '@/app/lib/constant';
import { Category, SubCategory } from '@prisma/client';
import axios from 'axios';
import DeleteModal from '../Modals/delete/DeleteModal';
import EditClient from '../Modals/edit/EditClient';

interface PropTypes {
  categories: Category[];
  clients: UserType[];
  handleUpdateClient: (userId: number, updatedData: any) => void;
  handleDeleteClientUI: (clientId: number) => void;
  setNotification: Dispatch<SetStateAction<Notification>>;
  selectedClients: UserType[];
  handleSelectClient: (e: any, targetClient: UserType) => void;
  handleSelectAll: () => void;
  subCategories: SubCategory[];
}

const ClientsTable = ({
  categories,
  clients,
  handleUpdateClient,
  handleDeleteClientUI,
  setNotification,
  selectedClients,
  handleSelectClient,
  handleSelectAll,
  subCategories,
}: PropTypes) => {
  const windowDimensions = useWindowDimensions();

  const handleDeleteClient = async (client: UserType) => {
    try {
      const response = await axios.delete(
        `${API_URL.CLIENTS}?userId=${client.id}`,
      );

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        return;
      }

      handleDeleteClientUI(client.id);
      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
    } catch (error: any) {
      console.log('Fail to delete order: ' + error);
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to delete order: ' + error,
      });
      return;
    }
  };

  function fixedHeaderContent() {
    return (
      <TableRow>
        <TableCell padding="checkbox" variant="head">
          <Checkbox
            checked={selectedClients.length === clients.length}
            onClick={handleSelectAll}
          />
        </TableCell>
        <TableCell variant="head" style={{ width: 150 }}>
          <Typography fontWeight="bold">Order Type</Typography>
        </TableCell>
        <TableCell variant="head" style={{ width: 150 }}>
          <Typography fontWeight="bold">Payment Type</Typography>
        </TableCell>
        <TableCell variant="head" style={{ width: 100 }}>
          <Typography fontWeight="bold">Client Id</Typography>
        </TableCell>
        <TableCell variant="head" style={{ width: 200 }}>
          <Typography fontWeight="bold">Name</Typography>
        </TableCell>
        <TableCell variant="head" style={{ width: 120 }}>
          <Typography fontWeight="bold">Category</Typography>
        </TableCell>
        <TableCell variant="head" style={{ width: 120 }}>
          <Typography fontWeight="bold">Subcategory</Typography>
        </TableCell>
        <TableCell variant="head" style={{ width: 120 }}>
          <Typography fontWeight="bold">Contact Number</Typography>
        </TableCell>
        <TableCell variant="head" style={{ width: 200 }}>
          <Typography fontWeight="bold">Delivery Address</Typography>
        </TableCell>
        <TableCell variant="head" style={{ width: 120 }}></TableCell>
      </TableRow>
    );
  }

  function rowContent(_index: number, client: UserType) {
    const isClientSelected = selectedClients.some(
      (targetClient: UserType) => client.id === targetClient.id,
    );
    return (
      <>
        <TableCell padding="checkbox">
          <Checkbox
            onClick={(e) => handleSelectClient(e, client)}
            checked={isClientSelected}
          />
        </TableCell>
        <TableCell>
          <Select
            value={client.preference?.orderType || 'N/A'}
            onChange={(e) =>
              handleUpdateClient(client.id, { orderType: e.target.value })
            }
          >
            <MenuItem value={'N/A'}>N/A</MenuItem>
            {orderTypes.map((orderType, index) => {
              return (
                <MenuItem key={index} value={orderType.text}>
                  <StatusText
                    text={orderType.text.toUpperCase()}
                    type={orderType.type}
                  />
                </MenuItem>
              );
            })}
          </Select>
        </TableCell>
        <TableCell>
          <Select
            value={client.preference?.paymentType || 'N/A'}
            onChange={(e) =>
              handleUpdateClient(client.id, { paymentType: e.target.value })
            }
          >
            <MenuItem value={'N/A'}>N/A</MenuItem>
            {paymentTypes.map((type, index) => {
              return (
                <MenuItem value={type} key={index}>
                  {type.toUpperCase()}
                </MenuItem>
              );
            })}
          </Select>
        </TableCell>
        <TableCell>{client.clientId}</TableCell>
        <TableCell>{client.clientName}</TableCell>
        <TableCell>{client.category.name}</TableCell>
        <TableCell>
          <Select
            value={client.subCategoryId || 'N/A'}
            onChange={(e, newValue) => {
              console.log(newValue);
              handleUpdateClient(client.id, { subCategoryId: +e.target.value });
            }}
          >
            <MenuItem value={'N/A'}>N/A</MenuItem>
            {subCategories &&
              subCategories.map((subCategory: SubCategory, index: number) => {
                return (
                  <MenuItem value={subCategory.id} key={index}>
                    {subCategory.name}
                  </MenuItem>
                );
              })}
          </Select>
        </TableCell>
        <TableCell>{client.contactNumber}</TableCell>
        <TableCell>{client.deliveryAddress}</TableCell>
        <TableCell>
          <Box display="flex" gap={1}>
            <DeleteModal
              includedButton
              targetObj={client}
              handleDelete={handleDeleteClient}
            />
            <EditClient
              client={client}
              // setNotification={setNotification}
              categories={categories}
              handleUpdateClient={handleUpdateClient}
            />
          </Box>
        </TableCell>
      </>
    );
  }

  const VirtuosoTableComponents: TableComponents<any> = {
    Table: (props) => (
      <Table
        {...props}
        sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }}
      />
    ),
    TableHead,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TableRow: ({ item: item, ...props }) => {
      const isClientSelected = selectedClients.some(
        (targetClient: UserType) => item.id === targetClient.id,
      );
      return (
        <TableRow
          aria-checked={isClientSelected}
          selected={isClientSelected}
          sx={{ cursor: 'pointer' }}
          {...props}
        />
      );
    },
    TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
      <TableBody {...props} ref={ref} />
    )),
  };

  return (
    <Paper style={{ height: windowDimensions.height - 250, overflowX: 'auto' }}>
      <TableVirtuoso
        data={clients}
        components={VirtuosoTableComponents}
        fixedHeaderContent={fixedHeaderContent}
        itemContent={rowContent}
      />
    </Paper>
  );
};

export default ClientsTable;
