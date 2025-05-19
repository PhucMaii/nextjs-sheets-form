import ErrorComponent from '@/app/admin/[companyId]/components/ErrorComponent';
import { BoxModal } from '@/app/admin/[companyId]/components/Modals/styled';
import { ModalProps } from '@/app/admin/[companyId]/components/Modals/type';
import { IItem } from '@/app/utils/type';
import useDebounce from '@/hooks/useDebounce';
import { Box, Modal, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import ItemRow from '../SellingItemName';

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
              <ItemRow
                key={index}
                item={item}
                onChangeItem={handleOnChangeItem}
                // itemList={items}
                setItemList={setItems}
              />
            ))
          ) : (
            <ErrorComponent errorText="No items found" />
          )}
        </Box>
      </BoxModal>
    </Modal>
  );
}
