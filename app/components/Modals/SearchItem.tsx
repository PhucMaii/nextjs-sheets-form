import ErrorComponent from '@/app/admin/components/ErrorComponent';
import { BoxModal } from '@/app/admin/components/Modals/styled';
import { ModalProps } from '@/app/admin/components/Modals/type';
import { IItem } from '@/app/utils/type';
import useDebounce from '@/hooks/useDebounce';
import { Box, Modal, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import SellingItemName from '../SellingItemName';

interface IProps extends ModalProps {
  items: IItem[];
  setItems: any;
}

export default function SearchItem({ open, onClose, items, setItems }: IProps) {
  const [searchKeywords, setSearchKeywords] = useState<string>('');
  const [displayItems, setDisplayItems] = useState<IItem[]>([]);

  const debouncedKeywords = useDebounce(searchKeywords, 1000);

  useEffect(() => {
    if (debouncedKeywords) {
      const newItems = items.filter((item: IItem) =>
        item.name.toLowerCase().includes(debouncedKeywords.toLowerCase()),
      );
      setDisplayItems(newItems);
    } else {
      setDisplayItems([]);
    }
  }, [debouncedKeywords]);

  const handleOnChangeItem = (item: IItem, quantity: number) => {
    const newItems = items.map((i: IItem) => {
      if (i.id === item.id) {
        return {
          ...i,
          quantity: quantity,
        };
      }
      return i;
    });
    setItems(newItems);

    const newDisplayItems = displayItems.map((i: IItem) => {
      if (i.id === item.id) {
        return {
          ...i,
          quantity: quantity,
        };
      }
      return i;
    });
    setDisplayItems(newDisplayItems);
  };
  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <Typography>Search Items</Typography>
        <TextField
          fullWidth
          value={searchKeywords}
          onChange={(e) => setSearchKeywords(e.target.value)}
          placeholder="Search Items..."
          variant="filled"
          sx={{ mt: 2 }}
        />

        <Box mt={2} display="flex" flexDirection="column" gap={2}>
          {displayItems.length > 0 ? (
            displayItems.map((item: IItem, index: number) => (
              <Box key={index} display="flex" gap={1} flexDirection="column">
                {/* <Typography
                  key={item.id}
                  sx={{ color: item.availability ? 'black' : grey[500] }}
                >
                  {`${item.name} - ${
                    !item.availability
                      ? 'Out of stock'
                      : item.price === 0
                        ? ' Variable price'
                        : `$${item.price.toFixed(2)}`
                  }`}
                </Typography> */}
                <SellingItemName item={item} />
                <TextField
                  fullWidth
                  variant="outlined"
                  value={item.quantity}
                  onChange={(e: any) =>
                    handleOnChangeItem(item, Number(e.target.value))
                  }
                  disabled={!item.availability}
                />
              </Box>
            ))
          ) : (
            <ErrorComponent errorText="No items found" />
          )}
        </Box>
      </BoxModal>
    </Modal>
  );
}
