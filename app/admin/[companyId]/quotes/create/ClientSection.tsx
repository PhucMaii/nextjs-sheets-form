import { Button, TextField, Typography } from '@mui/material';
import { Box } from '@mui/material';
import { Grid } from '@mui/material';
import React, { memo } from 'react';
import AutoCompleteAddress from '../../components/AutoCompleteAddress';
import { ShadowSection } from '../../reports/styled';

interface IProps {
  selectedClient: any;
  setSelectedClient?: (client: any) => void;
  client?: any;
  setClient?: (client: any) => void;
  setAddress?: (address: any) => void;
  renderClientSearch?: () => React.ReactNode;
  onResetNewCustomer?: () => void;
  blockEdit?: boolean;
}

const ClientSection = ({
  selectedClient,
  client,
  setClient,
  setAddress,
  renderClientSearch,
  onResetNewCustomer,
  blockEdit = false,
}: IProps) => {
  return (
    <ShadowSection display="flex" flexDirection="column" gap={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body1" fontWeight="semibold">
          Customer
        </Typography>
        {selectedClient && !blockEdit && (
          <Button color="primary" onClick={onResetNewCustomer}>
            New Customer
          </Button>
        )}
      </Box>

      {renderClientSearch && renderClientSearch()}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="body1" fontWeight="medium">
              Client Id (required)
            </Typography>
            {selectedClient && !blockEdit ? (
              <Typography variant="body1">{selectedClient.clientId}</Typography>
            ) : (
              <TextField
                label="Client Id"
                value={client?.clientId}
                onChange={(e) => {
                  setClient && setClient({
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
            <Typography variant="body1" fontWeight="medium">
              Client Name (required)
            </Typography>
            {selectedClient && !blockEdit ? (
              <Typography variant="body1">
                {selectedClient.clientName}
              </Typography>
            ) : (
              <TextField
                label="Client Name"
                value={client?.clientName}
                onChange={(e) => {
                  setClient && setClient({
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
            <Typography variant="body1" fontWeight="medium">
              Email
            </Typography>
            {selectedClient && !blockEdit ? (
              <Typography variant="body1">
                {selectedClient?.email || 'N/A'}
              </Typography>
            ) : (
              <TextField
                label="Email"
                value={client?.email}
                onChange={(e) => {
                  setClient && setClient({
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
            <Typography variant="body1" fontWeight="medium">
              Contact Number
            </Typography>
            {selectedClient && !blockEdit ? (
              <Typography variant="body1">
                {selectedClient?.contactNumber || 'N/A'}
              </Typography>
            ) : (
              <TextField
                label="Contact Number"
                value={client?.contactNumber}
                onChange={(e) => {
                  setClient && setClient({
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
            <Typography variant="body1" fontWeight="medium">
              Address (required)
            </Typography>
            {selectedClient && !blockEdit ? (
              <Typography variant="body1">
                {selectedClient?.deliveryAddress || 'N/A'}
              </Typography>
            ) : (
              <AutoCompleteAddress
                onDataReceived={(data) => {
                  setAddress && setAddress(data);
                }}
              />
            )}
          </Box>
        </Grid>
      </Grid>
    </ShadowSection>
  );
}

export default memo(ClientSection, (prevProps, nextProps) => {
  return (
    Object.is(prevProps.selectedClient, nextProps.selectedClient) &&
    Object.is(prevProps.client, nextProps.client) &&
    Object.is(prevProps.setClient, nextProps.setClient) &&
    Object.is(prevProps.renderClientSearch, nextProps.renderClientSearch)
  );
});