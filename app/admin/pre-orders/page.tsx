'use client';
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import AuthenGuard from '@/app/HOC/AuthenGuard';
import { ShadowSection } from '../reports/styled';
import { Grid, Tab, Tabs } from '@mui/material';
import { days } from '@/app/lib/constant';
import OverviewCard from '../components/OverviewCard/OverviewCard';
import { blue } from '@mui/material/colors';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import ClientOrdersTable from '../components/ClientOrdersTable';
import { Order } from '../orders/page';
import { Notification } from '@/app/utils/type';
import NotificationPopup from '../components/Notification';

export default function ScheduledOrderPage() {
  const [notification, setNotification] = useState<Notification>({
    on: true,
    type: 'info',
    message: ''
  });
  const [baseOrderList, setBaseOrderList] = useState<Order[]>([]);
  const [orderList, setOrderList] = useState<Order[]>([]);
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);

  const handleDeleteOrderUI = (deletedOrder: Order) => {
    // update base order list
    const newBaseOrderList = baseOrderList.filter((order: Order) => {
      return order.id !== deletedOrder.id;
    });

    // update current displaying list
    const newOrderList = orderList.filter((order: Order) => {
      return order.id !== deletedOrder.id;
    });

    setBaseOrderList(newBaseOrderList);
    setOrderList(newOrderList);
  };

  const handleSelectOrder = (e: any, targetOrder: Order) => {
    e.preventDefault();
    const selectedOrder = selectedOrders.find((order: Order) => {
      return order.id === targetOrder.id;
    });

    if (selectedOrder) {
      const newSelectedOrders = selectedOrders.filter((order: Order) => {
        return order.id !== targetOrder.id;
      });
      setSelectedOrders(newSelectedOrders);
    } else {
      setSelectedOrders([...selectedOrders, targetOrder]);
    }
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orderList.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orderList);
    }
  };

  const handleUpdateOrderUI = (updatedOrder: Order) => {
    // update base order list
    const newBaseOrderList = baseOrderList.map((order: Order) => {
      if (order.id === updatedOrder.id) {
        return updatedOrder;
      }
      return order;
    });

    // update current displaying order list
    const newOrderList = orderList.map((order: Order) => {
      if (order.id === updatedOrder.id) {
        return updatedOrder;
      }
      return order;
    });

    setBaseOrderList(newBaseOrderList);
    setOrderList(newOrderList);
  };


  return (
    <Sidebar>
      <AuthenGuard>
        <NotificationPopup 
          notification={notification}
          onClose={() => setNotification({...notification, on: false})}
        />
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <OverviewCard
              icon={
                <ReceiptIcon sx={{ color: blue[700], fontSize: 50 }} />
              }
              text="Total Clients"
              // value={baseClientList.length}
              value={200}

            />
          </Grid>
          <Grid item xs={12} md={4}>
            <OverviewCard
              icon={<AttachMoneyIcon sx={{ color: blue[700], fontSize: 50 }} />}
              text="No. clients use the app"
              value={200}
              // value={numberOfUserUsingApp().numberOfUsers as number}
              // helperText={`${numberOfUserUsingApp().percentage}% of total`}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <OverviewCard
              icon={
                <PeopleOutlineIcon sx={{ color: blue[700], fontSize: 50 }} />
              }
              text="No. clients pay monthly"
              // helperText={`${numberOfUserPayMonthly().percentage}% of total`}
              // value={numberOfUserPayMonthly().numberOfUsers as number}
              value={200}

            />
          </Grid>
        </Grid>
        <ShadowSection>
          <Tabs
            aria-label="basic tabs"
            value={tabIndex}
            onChange={(e, newValue) => setTabIndex(newValue)}
            variant="fullWidth"
          >
            {days &&
              days.map((day: string, index: number) => {
                return (
                  <Tab
                    id={`simple-tab-${index}`}
                    label={day}
                    aria-controls={`tabpanel-${index}`}
                  />
                );
              })}
          </Tabs>
          <ClientOrdersTable 
            handleDeleteOrderUI={handleDeleteOrderUI}
            handleUpdateOrderUI={handleUpdateOrderUI}
            clientOrders={orderList}
            setNotification={setNotification}
            selectedOrders={selectedOrders}
            handleSelectOrder={handleSelectOrder}
            handleSelectAll={handleSelectAll}
          />
        </ShadowSection>
      </AuthenGuard>
    </Sidebar>
  );
}
