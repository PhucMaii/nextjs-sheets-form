import {
  Box,
  Button,
  Divider,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ModalProps } from './type';
import { BoxModal } from './styled';
import ModalHead from '@/app/lib/ModalHead';
import useDebounce from '@/hooks/useDebounce';

interface IProps extends ModalProps {
  inventoryItems: any[];
  onAddItem: (item: any) => void;
  defaultSearchKeywords?: string;
}

export default function SearchInventoryItems({
  open,
  onClose,
  inventoryItems,
  onAddItem,
  defaultSearchKeywords,
}: IProps) {
  const [displayItems, setDisplayItems] = useState<any[]>([]);
  const [searchKeywords, setSearchKeywords] = useState<string>(
    defaultSearchKeywords || '',
  );

  const debouncedSearch = useDebounce(searchKeywords, 500);

  useEffect(() => {
    if (defaultSearchKeywords) {
      setSearchKeywords(defaultSearchKeywords);
    }
  }, [defaultSearchKeywords]);

  useEffect(() => {
    if (debouncedSearch) {
      const filteredItems = inventoryItems.filter((item: any) => {
        return (
          item?.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          item?.sku?.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
      });
      setDisplayItems(filteredItems);
    } else {
      setDisplayItems(inventoryItems);
    }
  }, [debouncedSearch]);

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal maxHeight="80vh" overflow="auto">
        <ModalHead
          heading="Search Inventory Items"
          onClose={onClose}
          buttonLabel="Search"
          buttonProps={{}}
          onClick={() => {}}
        />

        <Divider sx={{ my: 2 }} />

        <TextField
          label="Search"
          fullWidth
          value={searchKeywords}
          onChange={(e: any) => {
            setSearchKeywords(e.target.value);
          }}
        />

        <Box display="flex" flexDirection="column" gap={2} mt={2}>
          {displayItems.map((item: any) => (
            <Box
              key={item.id}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              gap={2}
            >
              <Typography fontWeight="semibold">
                {item.sku} | {item.name}
              </Typography>

              <Button onClick={() => onAddItem(item)}>Add</Button>
            </Box>
          ))}
        </Box>
      </BoxModal>
    </Modal>
  );
}
