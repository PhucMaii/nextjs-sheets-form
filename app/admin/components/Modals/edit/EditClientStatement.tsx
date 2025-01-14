import { AlertColor, Modal, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import ClientOrdersTable from '../../Tables/ClientOrdersTable';
import { Order } from '@/app/admin/orders/page';
import { onSelectAllOrders, onSelectOrders } from '@/app/utils/orders';
import { UserType } from '@/app/utils/type';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';

interface IProps extends ModalProps {
    showNotification: (type: AlertColor, message: string) => void;
    client: UserType;
    dateRange: Date[];
}

export default function EditClientStatement({open, onClose, showNotification, client, dateRange}: IProps) {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);

    const [clientOrders, mutateOrders, isValidating] = SWRFetchData(!client?.id ? '' : `${API_URL.ADMIN}/clients/orders?userId=${client.id}&startDate=${dateRange[0]}&endDate=${dateRange[1]}`);

    console.log(dateRange, 'date rnage')
    useEffect(() => {
        if (!isValidating && clientOrders) {
            setIsLoading(false);
        } else {
            setIsLoading(true)
        }
    }, [clientOrders]);
    console.log(client, 'client')
    console.log(clientOrders, 'client orders');

    const handleSelectOrder = (e: any, targetOrder: Order) => {
        e.preventDefault();
        onSelectOrders(targetOrder, selectedOrders, setSelectedOrders);
    }

  return (
    <Modal open={open} onClose={onClose}>
        <BoxModal maxHeight="80vh" overflow="scroll">
            <Typography variant="h5" textAlign="center" fontWeight="bold">
                {client?.clientName}
            </Typography>

            {isLoading ? <LoadingComponent /> : <ClientOrdersTable
                clientOrders={clientOrders?.data || []}
                showNotification={showNotification}
                selectedOrders={selectedOrders}
                handleSelectOrder={handleSelectOrder}
                handleSelectAll={() => onSelectAllOrders(selectedOrders, clientOrders?.data, setSelectedOrders)}
                mutateOrders={mutateOrders}
            />}
        </BoxModal>
    </Modal>
  )
}
