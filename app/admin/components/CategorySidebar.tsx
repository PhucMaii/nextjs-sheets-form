import { greyBackground } from '@/app/theme/color';
import { Box, Drawer, List, ListItemButton, ListItemText, Typography } from '@mui/material'
import { Category } from '@prisma/client';
import React from 'react';

interface IProps {
    categories: Category[];
    handleChangeTab: (newTab: any) => void;
    isNavOpen: boolean;
    onClose: () => void;
}

const drawerWidth = 250;
export default function CategorySidebar({categories, handleChangeTab, isNavOpen, onClose}: IProps) {
  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: 'none',
        },
      }}
      variant="temporary"
      anchor="left"
      open={isNavOpen}
      onClose={onClose}
    >
      <Typography variant="h4">Category</Typography>
      <List
        sx={{ width: '100%', maxWidth: 300, bgColor: greyBackground, mt: 2 }}
        component="nav"
        aria-labelledby="nested-list-subheader"
      >
        <Box display="flex" flexDirection="column" rowGap={2}>
            {
                categories && categories.map((category: Category, index: number) => {
                    return (
                        <ListItemButton key={index} onClick={() => handleChangeTab(category)}>
                            <ListItemText primary={category.name} />
                        </ListItemButton>
                    )
                })
            }
        </Box>
      </List>
    </Drawer>
  );
}
