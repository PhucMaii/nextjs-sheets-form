'use clients';
import {
  AlertColor,
  Box,
  Button,
  Checkbox,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import React, { memo } from 'react';
import { getAdminApiUrl, USER_CATEGORIZED } from '@/app/utils/enum';
import { UserType } from '@/app/utils/type';
import useWindowDimensions from '@/hooks/useWindowDimensions';
import { TableComponents, TableVirtuoso } from 'react-virtuoso';
import { paymentTypes } from '@/app/lib/constant';
import { Category } from '@prisma/client';
import axios from 'axios';
import DeleteModal from '../Modals/delete/DeleteModal';
import EditClient from '../Modals/edit/EditClient';
import { renderType } from '@/app/lib/render';
import { grey } from '@mui/material/colors';
import { useParams } from 'next/navigation';

interface PropTypes {
  categories: Category[];
  clients: UserType[];
  onUpdateClient: (userId: number, updatedData: any) => void;
  handleDeleteClientUI: (clientId: number) => void;
  showNotification: (type: AlertColor, message: string) => void;
  selectedClients: UserType[];
  handleSelectClient: (e: any, targetClient: UserType) => void;
  handleSelectAll: () => void;
  mutateClients: any;
  handleDirectToDetails: any;
}

const ClientsTable = ({
  categories,
  clients,
  onUpdateClient,
  handleDeleteClientUI,
  showNotification,
  selectedClients,
  handleSelectClient,
  handleSelectAll,
  mutateClients,
  handleDirectToDetails,
}: PropTypes) => {
  const { companyId }: any = useParams();
  const windowDimensions = useWindowDimensions();

  const handleDeleteClient = async (client: UserType) => {
    try {
      const response = await axios.delete(
        getAdminApiUrl(companyId, `/clients?userId=${client.id}`),
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      // Optimistic UI Update
      handleDeleteClientUI(client.id);

      // Update Real Data
      mutateClients();

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('Fail to delete order: ' + error);
      showNotification('error', 'Fail to delete order: ' + error);
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
        {/* <TableCell style={{ width: 50 }}></TableCell> */}
        <TableCell variant="head" style={{ width: 200 }}>
          <Typography fontWeight="bold">Payment Type</Typography>
        </TableCell>
        <TableCell variant="head" style={{ width: 200 }}>
          <Typography fontWeight="bold">Type</Typography>
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
        <TableCell variant="head" style={{ width: 250 }}>
          <Typography fontWeight="bold">Email</Typography>
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
            value={client.preference?.paymentType || 'N/A'}
            onChange={(e) =>
              onUpdateClient(client.id, { paymentType: e.target.value })
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
        <TableCell>
          {client?.type &&
            client.type !== USER_CATEGORIZED.NONE &&
            renderType(client.type)}
        </TableCell>
        <TableCell>{client.clientId}</TableCell>
        <TableCell>{client.clientName}</TableCell>
        <TableCell>{client?.category?.name}</TableCell>
        <TableCell>{client?.email}</TableCell>
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
              showNotification={showNotification}
              categories={categories}
              onUpdateClient={onUpdateClient}
            />
            <Button onClick={() => handleDirectToDetails(client)}>View</Button>
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TableRow: ({ item: client, ...props }) => {
      const isClientSelected = selectedClients.some(
        (targetClient: UserType) => client.id === targetClient.id,
      );

      return (
        <TableRow
          aria-checked={isClientSelected}
          selected={isClientSelected}
          sx={{
            cursor: 'pointer',
            backgroundColor:
              client?.type && client?.type === USER_CATEGORIZED.INACTIVE
                ? grey[200]
                : 'white',
          }}
          {...props}
        />
      );
    },
    // eslint-disable-next-line react/display-name
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

export default memo(ClientsTable, (prev, next) => {
  return (
    prev.clients === next.clients &&
    prev.selectedClients === next.selectedClients
  );
});
