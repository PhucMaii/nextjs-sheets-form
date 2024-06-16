import { greyBackground } from '@/app/theme/color';
import {
  Box,
  IconButton,
  List,
  ListItemText,
  Slide,
  Typography,
} from '@mui/material';
import { Category } from '@prisma/client';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import React from 'react';
import { ListItemButtonStyled } from './styled';
import { blueGrey } from '@mui/material/colors';

interface IProps {
  categories: Category[];
  currentCategory: Category | null;
  handleChangeTab: (newTab: any) => void;
  isNavOpen: boolean;
  setIsNavOpen: any;
  children: any;
}

const drawerWidth = 300;
export default function CategorySidebar({
  currentCategory,
  categories,
  handleChangeTab,
  isNavOpen,
  setIsNavOpen,
  children,
}: IProps) {
  return (
    <>
      {!isNavOpen && (
        <Box>
          <IconButton onClick={() => setIsNavOpen(true)}>
            <ArrowForwardIcon />
          </IconButton>
        </Box>
      )}
      <Box display="flex">
        <Slide direction="right" in={isNavOpen} mountOnEnter unmountOnExit>
          <Box
            sx={{
              backgroundColor: 'white',
              m: '0 !important',
              boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
            }}
            overflow="auto"
            maxHeight="100vh"
          >
            <Box
              display="flex"
              gap={1}
              m={2}
              flexWrap="wrap"
              alignItems="center"
            >
              <IconButton onClick={() => setIsNavOpen(false)}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h5">Category</Typography>
            </Box>
            <List
              sx={{
                width: '100%',
                maxWidth: drawerWidth,
                bgColor: greyBackground,
                mt: 2,
              }}
              component="nav"
              aria-labelledby="nested-list-subheader"
            >
              <Box display="flex" flexDirection="column" rowGap={2}>
                {categories &&
                  categories.map((category: Category, index: number) => {
                    return (
                      <ListItemButtonStyled
                        $currentTab={currentCategory?.name === category.name}
                        $textColor={blueGrey[900]}
                        $bgColor={blueGrey[50]}
                        key={index}
                        onClick={() => handleChangeTab(category)}
                      >
                        <ListItemText primary={category.name} />
                      </ListItemButtonStyled>
                    );
                  })}
              </Box>
            </List>
          </Box>
        </Slide>
        <Box m={2} width="100%">
          {children}
        </Box>
      </Box>
    </>
  );
}
