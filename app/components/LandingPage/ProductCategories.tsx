import { generateImgUrl } from '@/app/lib/s3';
import { API_URL } from '@/app/utils/enum';
import { IItemType } from '@/app/utils/type';
import { maxWidth } from '@/constant/landingPage';
import { Box, Grid, Typography } from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function ProductCategories() {
  const [itemTypes, setItemTypes] = useState<IItemType[] | any[]>([]);

  const router = useRouter();

  useEffect(() => {
    const fetchItemTypes = async () => {
      try {
        const response = await axios.get(`${API_URL.PUBLIC}/types`);

        if (response.data.error) {
          return;
        }

        setItemTypes(response.data.data);
      } catch (error: any) {
        console.log('Fail to fetch types', error);
      }
    };
    fetchItemTypes();
  }, []);
  return (
    <Box sx={{ backgroundColor: 'white' }}>
      <Box sx={{ maxWidth: maxWidth, mx: 'auto', pt: 4 }}>
        <Typography variant="h4" textAlign="center">
          Product Categories
        </Typography>

        <Grid container spacing={2} mt={2} alignItems="flex-end">
          {itemTypes.map((itemType: any, index: number) => {
            return (
              <Grid
                item
                xs={6}
                sm={4}
                md={3}
                lg={2}
                key={index}
                sx={{
                  '&:hover': {
                    cursor: 'pointer',
                    transform: 'scale(1.05)',
                    transition: 'all 0.3s ease-in-out',
                  },
                }}
                onClick={() =>
                  router.push(`/products?type=${encodeURIComponent(itemType?.name)}`)
                }
              >
                <Box display="flex" flexDirection="column" alignItems="center">
                  <img
                    src={
                      itemType?.items[0]?.image ||
                      itemType?.items[0]?.inventoryItem?.image
                        ? generateImgUrl(
                            itemType?.items[0]?.image ||
                              itemType?.items[0]?.inventoryItem?.image
                          )
                        : '/images/not-found.png'
                    }
                    alt={itemType?.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      borderRadius: 10,
                    }}
                  />
                  <Typography
                    variant="subtitle1"
                    textAlign="center"
                    sx={{ fontWeight: 'medium' }}
                  >
                    {itemType?.name}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
}
