import { generateImgUrl } from '@/app/lib/s3';
import { API_URL } from '@/app/utils/enum';
import { IItemType } from '@/app/utils/type';
import { maxWidth } from '@/constant/landingPage';
import { Box, Grid, Typography } from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import MotionSection from '../MotionSection';

const ItemTypeDisplay = ({
  itemType,
  onClick,
}: {
  itemType: IItemType;
  onClick: () => void;
}) => {
  const [img, setImg] = useState<string | undefined>(undefined);

  useEffect(() => {
    generateImgUrl(
      itemType?.items[0]?.image || itemType?.items[0]?.inventoryItem?.image,
    ).then((img) => {
      setImg(img);
    });
  }, [itemType]);

  return (
    <Grid
      item
      xs={6}
      sm={4}
      md={3}
      lg={2}
      sx={{
        '&:hover': {
          cursor: 'pointer',
          transform: 'scale(1.05)',
          transition: 'all 0.3s ease-in-out',
        },
      }}
      onClick={onClick}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        sx={{ width: '100%' }}
      >
        <img
          src={img || ''}
          alt={itemType?.name}
          style={{
            width: '100%',
            height: 200,
            // objectFit: 'cover',
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
};

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
    <MotionSection>
      <Box sx={{ backgroundColor: 'white' }}>
        <Box sx={{ maxWidth: maxWidth, mx: 'auto', pt: 4, px: 6 }}>
          <Typography variant="h4" textAlign="center">
            Product Categories
          </Typography>

          <Grid container spacing={2} alignItems="flex-end">
            {itemTypes.map((itemType: any, index: number) => {
              return (
                <ItemTypeDisplay
                  key={index}
                  itemType={itemType}
                  onClick={() =>
                    router.push(
                      `/products?type=${encodeURIComponent(itemType?.name)}`,
                    )
                  }
                />
              );
            })}
          </Grid>
        </Box>
      </Box>
    </MotionSection>
  );
}
