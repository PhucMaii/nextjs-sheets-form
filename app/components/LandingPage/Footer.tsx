import { Box, Divider, Grid, Typography } from '@mui/material';
import React from 'react';
import Logo from './Logo';
import Link from 'next/link';
import { landingPagePrimaryColor, maxWidth } from '@/constant/landingPage';
import { grey } from '@mui/material/colors';

const textColor = grey[300];
const linkStyles = { textDecoration: 'none', color: textColor };

export default function Footer() {
  return (
    <Box sx={{ backgroundColor: landingPagePrimaryColor }}>
      <Grid
        container
        alignItems="flex-start"
        rowGap={2}
        sx={{ py: 8, px: 8, maxWidth: maxWidth, mx: 'auto' }}
      >
        <Grid item xs={12}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2606.1584696113405!2d-122.97271562337944!3d49.216521675436766!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x548676366b9e4913%3A0xa476b0d9c6164ba3!2s6420%20Beresford%20St.%2C%20Burnaby%2C%20BC%20V5E%201B3!5e0!3m2!1sen!2sca!4v1741209009684!5m2!1sen!2sca"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen
            // allowfullscreen
            loading="lazy"
            // referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </Grid>
        <Grid item xs={12} md={6} textAlign="center">
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="flex-start"
            gap={2}
          >
            <Logo width={60} height={60} />
            <Typography
              variant="h6"
              fontWeight="medium"
              sx={{ color: textColor }}
            >
              Supreme Sprouts Ltd.
            </Typography>
            <Typography
              variant="h6"
              fontWeight="normal"
              textAlign="left"
              sx={{ color: textColor }}
            >
              <strong>Address:</strong> <br />
              Unit 1 - 6420 Beresford Street,
              <br />
              Burnaby, BC, Canada <br />
              V5E 1B6
            </Typography>
            <Typography
              variant="h6"
              fontWeight="normal"
              textAlign="left"
              sx={{ color: textColor }}
            >
              <strong>Hours:</strong> <br />
              Open daily for your convenience
            </Typography>
            <Typography
              variant="h6"
              fontWeight="normal"
              textAlign="left"
              sx={{ color: textColor }}
            >
              <strong>Contact Number:</strong> <br />
              +1 778-789-1060 <br />
              +1 709-989-6000
            </Typography>
            <Typography
              variant="h6"
              fontWeight="normal"
              textAlign="left"
              sx={{ color: textColor }}
            >
              <strong>Email:</strong> <br />
              info@supremesprouts.com
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={3}>
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ color: textColor }}
            >
              Company
            </Typography>
            <Link href="/about" style={linkStyles}>
              <Typography variant="h6" fontWeight="normal">
                About us
              </Typography>
            </Link>
            <Link href="/application-form" style={linkStyles}>
              <Typography variant="h6" fontWeight="normal">
                Join us
              </Typography>
            </Link>
          </Box>
        </Grid>
        <Grid item xs={6} md={3}>
          <Box
            sx={{ color: textColor }}
            display="flex"
            flexDirection="column"
            justifyContent="flex-start"
            gap={2}
          >
            <Typography variant="h6" fontWeight="bold">
              Product
            </Typography>
            <Link href="/products" style={linkStyles}>
              <Typography variant="h6" fontWeight="normal">
                All Products
              </Typography>
            </Link>
            <Link href="/products?q=bean" style={linkStyles}>
              <Typography variant="h6" fontWeight="normal">
                Bean sprouts
              </Typography>
            </Link>
            <Link href="/products?q=basil" style={linkStyles}>
              <Typography variant="h6" fontWeight="normal">
                Basil
              </Typography>
            </Link>
            <Link href="/products?q=eggs" style={linkStyles}>
              <Typography variant="h6" fontWeight="normal">
                Eggs
              </Typography>
            </Link>
            <Link href="/products?q=vegetables" style={linkStyles}>
              <Typography variant="h6" fontWeight="normal">
                Vegetables
              </Typography>
            </Link>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={12} textAlign="center" sx={{ m: 0, p: 0 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="subtitle2" sx={{ color: textColor }}>
              © 2025 Supreme Sprouts
            </Typography>

            <Link href="/driver/login">
              <Typography variant="subtitle2" sx={{ color: textColor }}>
                Driver Login
              </Typography>
            </Link>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
