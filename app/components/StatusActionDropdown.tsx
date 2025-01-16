import { AlertColor, Box, Button, Menu, MenuItem, Typography } from '@mui/material';
import React, { useState } from 'react'
import { DropdownItemContainer } from '../admin/orders/styled';
import { API_URL, ORDER_STATUS } from '../utils/enum';
import { errorColor, infoColor, successColor, warningColor } from '@/theme/color';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import BlockIcon from '@mui/icons-material/Block';
import { Order } from '../admin/orders/page';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import axios from 'axios';
// import LoadingModal from '../admin/components/Modals/LoadingModal';

interface ActionProps {
    onClick: any;
    icon: any;
    label: string;
    color: string;
    disabled?: boolean;
}

interface IProps {
    selectedOrders: Order[];
    showNotification: (type: AlertColor, message: string) => void;
    setIsLoading: any;
    actions?: ActionProps[];
    fullWidth?: boolean;
    variant?: 'text' | 'outlined' | 'contained';
}

export default function StatusActionDropdown({selectedOrders, showNotification, setIsLoading, actions, fullWidth, variant}: IProps) {
    const [actionButtonAnchor, setActionButtonAnchor] =
    useState<null | HTMLElement>(null);
    const openActionsDropdown = Boolean(actionButtonAnchor);
    // const [isLoading, setIsLoading] = useState<boolean>(false);

    const onCloseActionAnchor = () => {
        setActionButtonAnchor(null);
    };

    const onUpdateStatus = async (status: ORDER_STATUS): Promise<void> => {
        setIsLoading(true);
        try {
          const response = await axios.put(API_URL.ORDER_STATUS, {
            status,
            updatedOrders: selectedOrders,
          });
    
          showNotification('success', response.data.message);
          setIsLoading(false);
        } catch (error: any) {
          console.log('Fail to mark all as completed: ', error);
          showNotification(
            'error',
            'Something went wrong. Please try again later - ERROR: ' +
              (error?.response?.data?.error || error),
          );
          setIsLoading(false);
        }
      };

  return (
    <>
        {/* <LoadingModal open={isLoading} /> */}
        <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        gap={2}
        width="100%"
        >
        <Button
            aria-controls={openActionsDropdown ? 'basic-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={openActionsDropdown ? 'true' : undefined}
            disabled={selectedOrders.length === 0}
            onClick={(e) => setActionButtonAnchor(e.currentTarget)}
            endIcon={<ArrowDownwardIcon />}
            variant={variant ? variant : 'outlined'}
            fullWidth={fullWidth} 
        >
            Actions
        </Button>
        <Menu
            id="basic-menu"
            anchorEl={actionButtonAnchor}
            open={openActionsDropdown}
            onClose={onCloseActionAnchor}
            MenuListProps={{
            'aria-labelledby': 'basic-button',
            }}
        >
            <MenuItem
            onClick={() => {
                onUpdateStatus(ORDER_STATUS.COMPLETED);
                onCloseActionAnchor();
            }}
            >
            <DropdownItemContainer display="flex" gap={2}>
                <CheckCircleIcon sx={{ color: successColor }} />
                <Typography>Mark as completed</Typography>
            </DropdownItemContainer>
            </MenuItem>
            <MenuItem
            onClick={() => {
                onUpdateStatus(ORDER_STATUS.DELIVERED);
                onCloseActionAnchor();
            }}
            >
            <DropdownItemContainer display="flex" gap={2}>
                <LocalShippingIcon sx={{ color: infoColor }} />
                <Typography>Mark as delivered</Typography>
            </DropdownItemContainer>
            </MenuItem>
            <MenuItem
            onClick={() => {
                onUpdateStatus(ORDER_STATUS.INCOMPLETED);
                onCloseActionAnchor();
            }}
            >
            <DropdownItemContainer display="flex" gap={2}>
                <PendingIcon sx={{ color: warningColor }} />
                <Typography>Mark as incompleted</Typography>
            </DropdownItemContainer>
            </MenuItem>
            <MenuItem
            onClick={() => {
                onUpdateStatus(ORDER_STATUS.VOID);
                onCloseActionAnchor();
            }}
            >
            <DropdownItemContainer display="flex" gap={2}>
                <BlockIcon sx={{ color: errorColor }} />
                <Typography>Mark as void</Typography>
            </DropdownItemContainer>
            </MenuItem>
            {
                actions && actions.length > 0 &&actions.map((action: ActionProps, index: number) => (
                    <MenuItem
                        key={index}
                        onClick={() => {
                            action.onClick();
                            onCloseActionAnchor();
                        }}
                        disabled={action.disabled}
                        >
                        <DropdownItemContainer display="flex" gap={2}>
                            <action.icon sx={{ color: action.color }} />
                            <Typography>{action.label}</Typography>
                        </DropdownItemContainer>
                    </MenuItem>
                ))
            }
            {/* <MenuItem
            onClick={() => {
                handleDeleteSelectedOrders();
                onCloseActionAnchor();
            }}
            >
            <DropdownItemContainer display="flex" gap={2}>
                <DeleteIcon sx={{ color: errorColor }} />
                <Typography>Delete</Typography>
            </DropdownItemContainer>
            </MenuItem> */}
        </Menu>
        </Box>
    </>
  )
}
