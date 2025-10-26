'use client';
import React from 'react';
import { Box, Grid, Skeleton, useMediaQuery } from '@mui/material';
import { BorderSection } from '../../reports/styled';

export default function CreditReportSkeleton() {
  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section Skeleton */}
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <Skeleton
          variant="circular"
          width={48}
          height={48}
          sx={{ borderRadius: 2 }}
        />
        <Skeleton
          variant="circular"
          width={56}
          height={56}
          sx={{ borderRadius: 2 }}
        />
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          width="100%"
        >
          <Box>
            <Skeleton variant="text" width={300} height={40} />
            <Skeleton variant="text" width={100} height={24} />
          </Box>
          <Skeleton
            variant="rectangular"
            width={100}
            height={40}
            sx={{ borderRadius: 1 }}
          />
        </Box>
      </Box>

      <Grid container spacing={2}>
        {/* Main Content Area */}
        <Grid item md={8} xs={12} display="flex" flexDirection="column" gap={1}>
          {/* Selected Client Section */}
          <BorderSection display="flex" flexDirection="column" gap={1}>
            <Skeleton variant="text" width={120} height={24} />
            <Skeleton variant="text" width={250} height={32} />
          </BorderSection>

          {/* Mobile Order Selection */}
          {mdDown && (
            <Grid item xs={12}>
              <BorderSection display="flex" flexDirection="column" gap={2}>
                <Skeleton variant="text" width={150} height={24} />
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={200}
                  sx={{ borderRadius: 1 }}
                />
              </BorderSection>
            </Grid>
          )}

          {/* Items and General Info Section */}
          <BorderSection display="flex" flexDirection="column" gap={2}>
            <Skeleton variant="text" width={180} height={24} />

            {/* Credit Type Selection */}
            <Skeleton
              variant="rectangular"
              width="100%"
              height={56}
              sx={{ borderRadius: 1 }}
            />

            {/* Form Fields */}
            <Box display="flex" flexDirection="column" gap={2}>
              <Skeleton
                variant="rectangular"
                width="100%"
                height={56}
                sx={{ borderRadius: 1 }}
              />
              <Skeleton
                variant="rectangular"
                width="100%"
                height={120}
                sx={{ borderRadius: 1 }}
              />
            </Box>

            {/* Items Table */}
            <Box display="flex" flexDirection="column" gap={1}>
              <Skeleton variant="text" width={100} height={24} />
              {/* Table Header */}
              <Box display="flex" gap={1}>
                <Skeleton
                  variant="rectangular"
                  width="30%"
                  height={40}
                  sx={{ borderRadius: 1 }}
                />
                <Skeleton
                  variant="rectangular"
                  width="20%"
                  height={40}
                  sx={{ borderRadius: 1 }}
                />
                <Skeleton
                  variant="rectangular"
                  width="20%"
                  height={40}
                  sx={{ borderRadius: 1 }}
                />
                <Skeleton
                  variant="rectangular"
                  width="20%"
                  height={40}
                  sx={{ borderRadius: 1 }}
                />
                <Skeleton
                  variant="rectangular"
                  width="10%"
                  height={40}
                  sx={{ borderRadius: 1 }}
                />
              </Box>
              {/* Table Rows */}
              {[1, 2, 3].map((index) => (
                <Box key={index} display="flex" gap={1}>
                  <Skeleton
                    variant="rectangular"
                    width="30%"
                    height={60}
                    sx={{ borderRadius: 1 }}
                  />
                  <Skeleton
                    variant="rectangular"
                    width="20%"
                    height={60}
                    sx={{ borderRadius: 1 }}
                  />
                  <Skeleton
                    variant="rectangular"
                    width="20%"
                    height={60}
                    sx={{ borderRadius: 1 }}
                  />
                  <Skeleton
                    variant="rectangular"
                    width="20%"
                    height={60}
                    sx={{ borderRadius: 1 }}
                  />
                  <Skeleton
                    variant="rectangular"
                    width="10%"
                    height={60}
                    sx={{ borderRadius: 1 }}
                  />
                </Box>
              ))}
            </Box>
          </BorderSection>

          {/* Credit Summary Section */}
          <BorderSection display="flex" flexDirection="column" gap={2}>
            <Skeleton variant="text" width={150} height={24} />
            <Box display="flex" flexDirection="column" gap={1}>
              <Skeleton
                variant="rectangular"
                width="100%"
                height={60}
                sx={{ borderRadius: 1 }}
              />
              <Skeleton
                variant="rectangular"
                width="100%"
                height={60}
                sx={{ borderRadius: 1 }}
              />
              <Skeleton
                variant="rectangular"
                width="100%"
                height={60}
                sx={{ borderRadius: 1 }}
              />
            </Box>
          </BorderSection>
        </Grid>

        {/* Desktop Sidebar */}
        {!mdDown && (
          <Grid item md={4}>
            <BorderSection display="flex" flexDirection="column" gap={2}>
              <Skeleton variant="text" width={150} height={24} />
              <Skeleton
                variant="rectangular"
                width="100%"
                height={200}
                sx={{ borderRadius: 1 }}
              />
            </BorderSection>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
