import {
  AlertColor,
  Grid,
  Modal,
  Typography,
  useMediaQuery,
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import ClientOrdersTable from '../../Tables/ClientOrdersTable';
import { Order } from '@/app/admin/orders/page';
import { onSelectAllOrders, onSelectOrders } from '@/app/utils/orders';
import { UserType } from '@/app/utils/type';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import { useReactToPrint } from 'react-to-print';
import { InvoicePrint } from '../../Printing/InvoicePrint';
import PrintIcon from '@mui/icons-material/Print';
import StatusActionDropdown from '@/app/components/StatusActionDropdown';
import { infoColor } from '@/theme/color';

interface IProps extends ModalProps {
  showNotification: (type: AlertColor, message: string) => void;
  client: UserType;
  dateRange: Date[];
}

export default function EditClientStatement({
  open,
  onClose,
  showNotification,
  client,
  dateRange,
}: IProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);

  const [clientOrders, mutateOrders, isValidating] = SWRFetchData(
    !client?.id
      ? ''
      : `${API_URL.ADMIN}/clients/orders?userId=${client.id}&startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
  );

  const invoiceRef: any = useRef();
  const mdDown = useMediaQuery((them: any) => them.breakpoints.down('md'));

  useEffect(() => {
    if (!isValidating && clientOrders) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [clientOrders]);

  useEffect(() => {
    setSelectedOrders([]);
  }, [client]);

  const handleSelectOrder = (e: any, targetOrder: Order) => {
    e.preventDefault();
    onSelectOrders(targetOrder, selectedOrders, setSelectedOrders);
  };

  const printInvoice = useReactToPrint({
    content: () => invoiceRef.current,
  });

  return (
    <>
      {clientOrders && (
        <div style={{ display: 'none' }}>
          <InvoicePrint
            client={client}
            orders={
              selectedOrders.length > 0 ? selectedOrders : clientOrders?.data
            }
            endDate={dateRange[1]}
            ref={invoiceRef}
          />
        </div>
      )}
      <Modal open={open} onClose={onClose}>
        <BoxModal
          maxHeight="80vh"
          width={mdDown ? '700px' : '1200px'}
          overflow="scroll"
        >
          <Grid container alignItems="center">
            <Grid item xs={4} />
            <Grid item xs={12} md={4} textAlign="center">
              <Typography variant="h5" textAlign="center" fontWeight="bold">
                {client?.clientName}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} textAlign="right">
              <StatusActionDropdown
                selectedOrders={selectedOrders}
                setIsLoading={setIsLoading}
                showNotification={showNotification}
                actions={[
                  {
                    label: 'Print Statement',
                    onClick: printInvoice,
                    disabled: selectedOrders.length === 0,
                    icon: PrintIcon,
                    color: infoColor,
                  },
                ]}
              />
            </Grid>
          </Grid>

          {isLoading ? (
            <LoadingComponent />
          ) : (
            <ClientOrdersTable
              clientOrders={clientOrders?.data || []}
              showNotification={showNotification}
              selectedOrders={selectedOrders}
              handleSelectOrder={handleSelectOrder}
              handleSelectAll={() =>
                onSelectAllOrders(
                  selectedOrders,
                  clientOrders?.data,
                  setSelectedOrders,
                )
              }
              mutateOrders={mutateOrders}
              onUpdateOrderUI={mutateOrders}
            />
          )}
        </BoxModal>
      </Modal>
    </>
  );
}
