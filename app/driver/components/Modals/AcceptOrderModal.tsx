import { BoxModal } from '@/app/admin/[companyId]/components/Modals/styled';
import { ModalProps } from '@/app/admin/[companyId]/components/Modals/type';
import { Order } from '@/app/admin/[companyId]/orders/page';
import ModalHead from '@/app/lib/ModalHead';
import { neutral, primary } from '@/theme/color';
import {
  Avatar,
  Box,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Modal,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import {
  Person as PersonIcon,
  Add as AddIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import { ShowNotificationType } from '@/hooks/useNotification';
import StatusText from '@/app/admin/[companyId]/components/StatusText';

interface IProps extends ModalProps {
  order: Order;
  showNotification: ShowNotificationType;
}

export default function AcceptOrderModal({
  open,
  onClose,
  order,
  showNotification,
}: IProps) {
  const [insertPosition, setInsertPosition] = useState<number | null>(null);
  const [noticeMsg, setNoticeMsg] = useState<string | null>(null);
  const [isAcceptingOrder, setIsAcceptingOrder] = useState<boolean>(false);

  const { data: route } = useQuery({
    queryKey: ['route', order?.reassignment?.from?.id],
    queryFn: async () => {
      const response = await axios.get(
        `${API_URL.DRIVER}/routes/${order?.reassignment?.toRouteId}`,
      );
      return response.data.data;
    },
    enabled: !!order?.reassignment?.toRouteId,
  });

  const handleSelectPosition = (index: number, msg: string) => {
    setNoticeMsg(msg);
    setInsertPosition(index);
  };

  const handleAcceptOrder = async () => {
    if (!insertPosition) {
      showNotification('error', 'Please select a position');
      return;
    }

    try {
      setIsAcceptingOrder(true);
      const response = await axios.post(
        `${API_URL.DRIVER}/orders/accept-orders`,
        {
          orderId: order?.id,
          index: insertPosition,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
      onClose();
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', error.response.data.error);
    } finally {
      setIsAcceptingOrder(false);
    }
  };

  return (
    <Modal open={open}>
      <BoxModal
        maxHeight="85vh"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <ModalHead
          heading="Accept Order"
          buttonLabel="Accept"
          onClick={handleAcceptOrder}
          buttonProps={{
            loading: isAcceptingOrder,
          }}
          onClose={() => {}}
        />

        {noticeMsg && (
          <Box sx={{ mt: 2 }}>
            <StatusText text={noticeMsg} type="info" icon={<InfoIcon />} />
          </Box>
        )}

        <Divider sx={{ my: 2 }} />
        <Box
          sx={{
            overflow: 'auto',
            maxHeight: 'calc(85vh - 200px)', // Account for modal header and padding
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            {order?.reassignment?.reassignedBy} has moved order for{' '}
            <b style={{fontWeight: 700}}>{order?.user?.clientName}</b> to you.
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Please insert into your route.
          </Typography>

          <List>
            {/* Insert at beginning option */}
            <ListItem
              button
              onClick={() => {
                handleSelectPosition(0, 'Insert at beginning');
              }}
              sx={{
                borderRadius: 2,
                background:
                  insertPosition === 0 ? primary.alpha4 : 'transparent',
                border:
                  insertPosition === 0
                    ? `2px solid ${primary.main}`
                    : '2px solid transparent',
                '&:hover': {
                  background: primary.alpha4,
                },
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    width: { xs: 28, sm: 32 },
                    height: { xs: 28, sm: 32 },
                    background: '#ff9800',
                  }}
                >
                  <AddIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Insert at beginning"
                primaryTypographyProps={{
                  fontWeight: insertPosition === 0 ? 600 : 400,
                  color: insertPosition === 0 ? primary.main : neutral[800],
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                }}
              />
            </ListItem>
            <Divider sx={{ my: 2 }} />

            {route?.clients &&
              route.clients.map((client: any, index: number) => (
                <React.Fragment key={client.user.id}>
                  <ListItem
                    sx={{
                      borderRadius: '6px',
                      '&:hover': {
                        background: primary.alpha4,
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          width: { xs: 28, sm: 32 },
                          height: { xs: 28, sm: 32 },
                          background: primary.main,
                        }}
                      >
                        <PersonIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={client.user.clientName}
                      primaryTypographyProps={{
                        fontWeight: 500,
                        color: neutral[800],
                        fontSize: {
                          xs: '0.75rem',
                          sm: '0.875rem',
                        },
                      }}
                    />
                  </ListItem>

                  {/* Insert after this client option */}
                  <ListItem
                    button
                    onClick={() => {
                      handleSelectPosition(
                        index + 1,
                        `Insert after ${client.user.clientName}`,
                      );
                    }}
                    sx={{
                      borderRadius: 2,
                      background:
                        insertPosition === index + 1
                          ? primary.alpha4
                          : 'transparent',
                      border:
                        insertPosition === index + 1
                          ? `2px solid ${primary.main}`
                          : '2px solid transparent',
                      '&:hover': {
                        background: primary.alpha4,
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          width: { xs: 28, sm: 32 },
                          height: { xs: 28, sm: 32 },
                          background: '#ff9800',
                        }}
                      >
                        <AddIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`Insert after ${client.user.clientName}`}
                      primaryTypographyProps={{
                        fontWeight: insertPosition === index + 1 ? 600 : 400,
                        color:
                          insertPosition === index + 1
                            ? primary.main
                            : neutral[800],
                        fontSize: {
                          xs: '0.75rem',
                          sm: '0.875rem',
                        },
                      }}
                      sx={{
                        borderRadius: 2,
                      }}
                    />
                  </ListItem>
                  <Divider sx={{ my: 2 }} />
                </React.Fragment>
              ))}
          </List>
        </Box>
      </BoxModal>
    </Modal>
  );
}
