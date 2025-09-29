import { BoxModal } from '@/app/admin/[companyId]/components/Modals/styled';
import { ModalProps } from '@/app/admin/[companyId]/components/Modals/type';
import { ShowNotificationType } from '@/hooks/useNotification';
import ModalHead from '@/app/lib/ModalHead';
import { Box, Divider, Modal, Typography } from '@mui/material';
import React, { Fragment, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import { days } from '@/app/lib/constant';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import { RouteIcon } from 'lucide-react';
import { LoadingButton } from '@mui/lab';
import { primary } from '@/theme/color';
import { UserContext } from '@/app/context/UserContextAPI';

interface IProps extends ModalProps {
  showNotification: ShowNotificationType;
  orderId: number;
}

export default function SelectRouteModal({
  open,
  onClose,
  showNotification,
  orderId,
}: IProps) {
    const { user } = useContext(UserContext);

  const today = new Date();
  const { data: routes, isLoading } = useQuery({
    queryKey: ['routes'],
    queryFn: async () => {
      const response = await axios.get(
        `${API_URL.DRIVER}/routes?day=${days[today.getDay()]}`,
      );
      return response.data.data;
    },
  });

  const currentRouteId = useMemo(() => {
    if (!routes || routes.length === 0) return null;
    return routes?.find((route: any) => route.employee?.id === user?.id)?.id;
  }, [routes, user]);

  const handleSelectRoute = async (routeId: number) => {
    try {
      const response = await axios.post(`${API_URL.DRIVER}/orders/switch-route`, {
        orderId: orderId,
        currentRouteId: currentRouteId,
        newRouteId: routeId,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
      onClose();
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', error.response.data.error);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal overflow="auto" maxHeight="85vh">
        <ModalHead
          heading="Select Route"
          buttonLabel=""
          onClick={() => {}}
          buttonProps={{}}
          onClose={onClose}
          onlyHeading
        />

        <Divider sx={{ my: 2 }} />

        {isLoading ? (
          <LoadingComponent />
        ) : (
          <Box display="flex" flexDirection="column" gap={2}>
            {routes?.map((route: any) => (
              <Fragment key={route.id}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <RouteIcon size={20} style={{ color: primary.main }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">{route.name}</Typography>
                      <Typography variant="subtitle2">
                        {route.employee?.name}
                      </Typography>
                    </Box>
                  </Box>
                  <LoadingButton variant="contained" onClick={() => handleSelectRoute(route.id)}>
                    Select
                  </LoadingButton>
                </Box>
                <Divider sx={{ my: 1 }} flexItem />
              </Fragment>
            ))}
          </Box>
        )}
      </BoxModal>
    </Modal>
  );
}
