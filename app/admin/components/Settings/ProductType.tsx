import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import AddProductType from '../Modals/add/AddProductType';
import useNotification from '@/hooks/useNotification';
import { useMultipleBoolean } from '@/hooks/useMultipleBoolean';
import { API_URL } from '@/app/utils/enum';
import { SWRFetchData } from '@/app/utils/db';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ErrorComponent from '../ErrorComponent';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EditProductType from '../Modals/edit/EditProductType';
import { IProductType } from '@/app/utils/type';
import DeleteModal from '../Modals/delete/DeleteModal';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function ProductType() {
  const [menuState, setMenuState] = useState<{
    anchorEl: HTMLElement | null;
    type: IProductType | null;
  }>({ anchorEl: null, type: null });
  const [open, setOpen] = useMultipleBoolean({
    addProductType: false,
    editProductType: false,
    deleteProductType: false,
  });
  const [edittingType, setEdittingType] = useState<null | IProductType>(null);
  const [deletingType, setDeletingType] = useState<null | IProductType>(null);
  const { showNotification, NotificationComp } = useNotification();
  const router = useRouter();

  const [types] = SWRFetchData(`${API_URL.ADMIN}/productTypes`);

  const handleDeleteType = async (type: IProductType) => {
    try {
      const response = await axios.delete(
        `${API_URL.ADMIN}/productTypes?id=${type.id}`,
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', 'Product Type deleted successfully');
      setOpen('deleteProductType', false);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', 'Internal Server Error: ' + error);
    }
  };

  const handleMenuOpen = (
    e: React.MouseEvent<HTMLElement>,
    type: IProductType,
  ) => {
    setMenuState({ anchorEl: e.currentTarget, type });
  };

  const handleMenuClose = () => {
    setMenuState({ anchorEl: null, type: null });
  };

  return (
    <Box>
      {NotificationComp}
      <DeleteModal
        open={open.deleteProductType}
        handleCloseModal={() => setOpen('deleteProductType', false)}
        handleDelete={handleDeleteType}
        targetObj={deletingType}
      />
      <AddProductType
        open={open.addProductType}
        onClose={() => setOpen('addProductType', false)}
        showNotification={showNotification}
      />
      <EditProductType
        open={open.editProductType}
        onClose={() => setOpen('editProductType', false)}
        showNotification={showNotification}
        type={edittingType}
      />
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h5" fontWeight="bold">
          Product Categories
        </Typography>

        <Button
          variant="contained"
          onClick={() => setOpen('addProductType', true)}
        >
          + New Category
        </Button>
      </Box>

      {/* Category Listing */}
      <Box display="flex" gap={3} flexWrap="wrap" alignItems="center" mt={3}>
        {types ? (
          types.data.map((type: any, index: number) => {
            return (
              <Box
                display="flex"
                flexDirection="column"
                gap={2}
                p={2}
                borderRadius={2}
                sx={{
                  boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
                  ':hover': { cursor: 'pointer' },
                }}
                onClick={() => router.push('/admin/productType/' + type.id)}
                key={index}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  gap={2}
                  justifyContent="space-between"
                >
                  <Typography variant="h6" fontWeight="bold">
                    {type.name}
                  </Typography>
                  <>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuOpen(e, type);
                      }}
                    >
                      <MoreHorizIcon />
                    </IconButton>
                    <Menu
                      anchorEl={menuState.anchorEl}
                      open={!!menuState.anchorEl}
                      onClose={() => handleMenuClose()}
                      PaperProps={{
                        elevation: 0,
                        sx: {
                          overflow: 'visible',
                          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                          mt: 1.5,
                          '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                          },
                          '&::before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                          },
                        },
                      }}
                      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                      <MenuItem
                        onClick={() => {
                          setOpen('editProductType', true);
                          setEdittingType(menuState.type);
                          handleMenuClose();
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={2}>
                          <EditIcon fontSize="small" />
                          <Typography>Edit</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setOpen('deleteProductType', true);
                          setDeletingType(menuState.type);
                          handleMenuClose();
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={2}>
                          <DeleteIcon fontSize="small" />
                          <Typography>Delete</Typography>
                        </Box>
                      </MenuItem>
                    </Menu>
                  </>
                </Box>
                <Typography variant="h6" fontWeight="normal">
                  {type.itemPreferences.length} products
                </Typography>
              </Box>
            );
          })
        ) : (
          <ErrorComponent errorText="No categories found" />
        )}
      </Box>
    </Box>
  );
}
