import {
  landingPagePrimaryColor,
  landingPageSecondaryColor,
} from '@/constant/landingPage';
import {
  Box,
  Button,
  Grid,
  InputAdornment,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

interface IProps {
  sx?: any;
}

export default function Header({ sx }: IProps) {
  const [searchKeywords, setSearchKeywords] = useState<string>('');

  const router = useRouter();

  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

  const onGoToSearchPage = () => {
    router.push(`/products?q=${searchKeywords}`);
  };

  return (
    <Grid
      container
      alignItems="center"
      // columnSpacing={2}
      px={4}
      sx={{
        position: 'relative', // Ensure the container is a positioned element
        overflow: 'hidden', // Prevent the pseudo-element from overflowing
        height: '90vh',
        ...sx,
        ':before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage:
            'url("/images/landing/header/beansprout_background.png")',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          filter: 'brightness(50%)',
          zIndex: -1, // Ensure the pseudo-element is behind the content
        },
      }}
    >
      <Grid item xs={12}>
        <Box display="flex" flexDirection="column" gap={2}>
          <Typography
            variant="h2"
            fontWeight="bold"
            textAlign="center"
            sx={{ color: 'white' }}
          >
            Freshness You Can Trust <br /> Prices You'll Love
          </Typography>
          <Typography
            variant="h5"
            fontWeight="normal"
            textAlign="center"
            sx={{ color: grey[100], lineHeight: 1.5 }}
          >
            Delivering farm-fresh produce with unmatched quality at competitive
            prices, <br /> tailored for your business needs.
          </Typography>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={2}
          >
            <Button
              onClick={() => router.push('/application-form')}
              variant="contained"
              sx={{
                width: 'fit-content',
                fontSize: 'large',
                backgroundColor: landingPagePrimaryColor,
                px: 3,
                py: 2,
                ':hover': { backgroundColor: landingPageSecondaryColor },
              }}
            >
              Join Us Today
            </Button>
            <Button
              variant="outlined"
              sx={{
                width: 'fit-content',
                fontSize: 'large',
                color: landingPagePrimaryColor,
                px: 3,
                py: 2,
                backgroundColor:
                  'rgba(0, 0, 0, 0.3)' /* Semi-transparent black (50% opacity) */,
                ':hover': {
                  backgroundColor: landingPageSecondaryColor,
                  color: 'white',
                },
              }}
              onClick={() => router.push('/about')}
            >
              Learn More
            </Button>
          </Box>

          <Box display="flex" justifyContent="center">
            <TextField
              variant="outlined"
              placeholder="What are you looking for today?"
              size="small"
              value={searchKeywords}
              onChange={(e: any) => setSearchKeywords(e.target.value)}
              sx={{
                borderRadius: 2,
                backgroundColor: grey[300],
                width: mdDown ? '100%' : '50%',
                maxWidth: 600,
                '.mui-apo49d-MuiInputBase-root-MuiOutlinedInput-root': {
                  padding: 1,
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      sx={{
                        backgroundColor: landingPagePrimaryColor,
                        color: 'white',
                        padding: '',
                        borderRadius: 1,
                        ':hover': {
                          backgroundColor: landingPageSecondaryColor,
                        },
                      }}
                      onClick={onGoToSearchPage}
                      disabled={!searchKeywords}
                    >
                      Search
                    </Button>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}
