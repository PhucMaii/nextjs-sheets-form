import { Box, Typography } from '@mui/material'
import { grey } from '@mui/material/colors'
import React from 'react'
import { IItem } from '../utils/type'

export default function SellingItemName({item}: {item: IItem}) {
  return (
    <Box display="flex" gap={1}>
        <Typography
          sx={{ color: item.availability ? 'black' : grey[500] }}
          fontWeight="bold"
          variant="subtitle1"
        >
          {`${item.name} - `}
        </Typography>
        {
          item?.isShowDiscount && item?.prevPrice && (
            <Typography
              fontWeight="bold"
              variant="subtitle1"
               sx={{ textDecoration: 'line-through' }}
                color="error"
            >
              {`$${item.prevPrice.toFixed(2)}`}
            </Typography>
          )
        }
        <Typography
          sx={{ color: item.availability ? 'black' : grey[500] }}
          fontWeight="bold"
          variant="subtitle1"
        >
          {
            `${
              !item.availability
                ? 'Out of stock'
                : item.price === 0
                  ? ' Variable price'
                  : `$${item.price.toFixed(2)}`
            }`
          }
        </Typography>
    </Box>
  )
}
