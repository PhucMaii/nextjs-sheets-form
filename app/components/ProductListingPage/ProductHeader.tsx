import React from 'react';
import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  OutlinedInput,
  Typography,
} from '@mui/material';
import { green, orange } from '@mui/material/colors';
import SearchIcon from '@mui/icons-material/Search';
import { landingPageSecondaryColor } from '@/constant/landingPage';

export default function ProductHeader() {
  return (
      <Box
        display="flex"
        flexDirection="column"
        gap={6}
        px={6}
        py={12}
        sx={{ backgroundColor: green[700], borderRadius: 5 }}
      >
        <Typography
          variant="h3"
          textAlign="center"
          fontWeight="bold"
          sx={{ color: 'white', lineHeight: 1.5 }}
        >
          Fresh, Handpicked, and Nutrient-Rich: Discover Our Premium Vegetable
          Selection Today!
        </Typography>

        <Box display="flex" alignItems="center" gap={2} px={6}>
          <FormControl fullWidth>
            <OutlinedInput
              placeholder="Search items you like..."
              size="small"
              sx={{ borderRadius: 2, backgroundColor: 'white' }}
              fullWidth
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              }
            />
          </FormControl>
          <Button
            variant="contained"
            sx={{
              width: 'fit-content',
              backgroundColor: landingPageSecondaryColor,
              ':hover': { backgroundColor: orange[800] },
            }}
          >
            Search
          </Button>
          {/* <TextField
                        label="Search Products"
                        placeholder="Search items you like..."
                        size="small"
                        sx={{borderRadius: 5, backgroundColor: 'white'}}
                        fullWidth
                        variant="outlined"
                        InputProps={{
                            style: {
                                borderRadius: 5,
                            },
                        }}
                        slotProps={{
                            input: {
                              startAdornment: <InputAdornment position="start">kg</InputAdornment>,
                            },
                          }}
                    /> */}
        </Box>
      </Box>
  );
}
