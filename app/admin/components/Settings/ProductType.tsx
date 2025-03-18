import { Box, Button, Typography } from '@mui/material';
import React from 'react';
import AddProductType from '../Modals/add/AddProductType';
import useNotification from '@/hooks/useNotification';
import { useMultipleBoolean } from '@/hooks/useMultipleBoolean';
import { API_URL } from '@/app/utils/enum';
import { SWRFetchData } from '@/app/utils/db';
import ErrorComponent from '../ErrorComponent';
import ProductTypeTable from './ProductType/ProductTypeTable';

export default function ProductType() {
  const [open, setOpen] = useMultipleBoolean({
    addProductType: false,
    editProductType: false,
    deleteProductType: false,
  });

  const { showNotification, NotificationComp } = useNotification();

  const [types] = SWRFetchData(`${API_URL.ADMIN}/productTypes`);

  // const onMenuOpen = (e: React.MouseEvent<HTMLElement>, type: IProductType) => {
  //   setMenuState({ anchorEl: e.currentTarget, type });
  // };

  // const onMenuClose = () => {
  //   setMenuState({ anchorEl: null, type: null });
  // };

  return (
    <Box sx={{ pb: 2 }}>
      {NotificationComp}
      <AddProductType
        open={open.addProductType}
        onClose={() => setOpen('addProductType', false)}
        showNotification={showNotification}
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
          <ProductTypeTable
            types={types.data}
            showNotification={showNotification}
          />
        ) : (
          // types.data.map((type: any, index: number) => {
          //   const IconComponent: any = type?.icon
          //     ? LucideIcons[type.icon as keyof typeof LucideIcons]
          //     : () => <></>;
          //   return (
          //     <Box
          //       display="flex"
          //       flexDirection="column"
          //       gap={2}
          //       p={2}
          //       borderRadius={2}
          //       sx={{
          //         boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
          //         ':hover': { cursor: 'pointer' },
          //       }}
          //       onClick={() => router.push('/admin/productType/' + type.id)}
          //       key={index}
          //     >
          //       <Box
          //         display="flex"
          //         alignItems="center"
          //         gap={2}
          //         justifyContent="space-between"
          //       >
          //         <Box display="flex" alignItems="center" gap={1}>
          //           <IconComponent />
          //           <Typography variant="h6" fontWeight="bold">
          //             {type.name}
          //           </Typography>
          //         </Box>

          //         <>
          //           <IconButton
          //             onClick={(e) => {
          //               e.stopPropagation();
          //               onMenuOpen(e, type);
          //             }}
          //           >
          //             <MoreHorizIcon />
          //           </IconButton>
          //           <Menu
          //             anchorEl={menuState.anchorEl}
          //             open={!!menuState.anchorEl}
          //             onClose={() => onMenuClose()}
          //             PaperProps={{
          //               elevation: 0,
          //               sx: {
          //                 overflow: 'visible',
          //                 filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
          //                 mt: 1.5,
          //                 '& .MuiAvatar-root': {
          //                   width: 32,
          //                   height: 32,
          //                   ml: -0.5,
          //                   mr: 1,
          //                 },
          //                 '&::before': {
          //                   content: '""',
          //                   display: 'block',
          //                   position: 'absolute',
          //                   top: 0,
          //                   right: 14,
          //                   width: 10,
          //                   height: 10,
          //                   bgcolor: 'background.paper',
          //                   transform: 'translateY(-50%) rotate(45deg)',
          //                   zIndex: 0,
          //                 },
          //               },
          //             }}
          //             transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          //             anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          //           >
          //             <MenuItem
          //               onClick={(e: any) => {
          //                 e.stopPropagation();
          //                 e.preventDefault();
          //                 setOpen('editProductType', true);
          //                 setEdittingType(menuState.type);
          //                 onMenuClose();
          //               }}
          //             >
          //               <Box display="flex" alignItems="center" gap={2}>
          //                 <EditIcon color="primary" fontSize="small" />
          //                 <Typography>Edit</Typography>
          //               </Box>
          //             </MenuItem>
          //             <MenuItem
          //               onClick={(e: any) => {
          //                 e.stopPropagation();
          //                 e.preventDefault();
          //                 setOpen('deleteProductType', true);
          //                 setDeletingType(menuState.type);
          //                 onMenuClose();
          //               }}
          //             >
          //               <Box display="flex" alignItems="center" gap={2}>
          //                 <DeleteIcon color="error" fontSize="small" />
          //                 <Typography>Delete</Typography>
          //               </Box>
          //             </MenuItem>
          //           </Menu>
          //         </>
          //       </Box>
          //       <Typography variant="h6" fontWeight="normal">
          //         {type.itemPreferences.length} products
          //       </Typography>
          //     </Box>
          //   );
          // })
          <ErrorComponent errorText="No categories found" />
        )}
      </Box>
    </Box>
  );
}
