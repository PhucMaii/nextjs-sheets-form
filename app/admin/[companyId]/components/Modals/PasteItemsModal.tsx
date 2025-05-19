import {
  AlertColor,
  Box,
  Divider,
  Grid,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { ModalProps } from './type';
import { BoxModal } from './styled';
import ModalHead from '@/app/lib/ModalHead';
import { ICategory, IItem } from '@/app/utils/type';
import ErrorComponent from '../ErrorComponent';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import { useParams } from 'next/navigation';
interface IProps extends ModalProps {
  currentCategoryId: number;
  showNotification: (type: AlertColor, message: string) => void;
  categories: ICategory[];
}

export default function PasteItemsModal({
  open,
  onClose,
  currentCategoryId,
  showNotification,
  categories,
}: IProps) {
  const { companyId }: any = useParams();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [newItems, setNewItems] = useState<IItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(-1);

  // Find the selected category object based on selectedCategoryId
  const selectedCategory = useMemo(() => {
    if (selectedCategoryId === -1) {
      return null;
    }

    return categories.find((category) => category.id === selectedCategoryId);
  }, [selectedCategoryId]);

  useEffect(() => {
    if (selectedCategory && selectedCategory.items) {
      setNewItems(selectedCategory.items);
    }
  }, [selectedCategory]);

  const handlePasteItems = async () => {
    setIsLoading(true);
    try {
      if (selectedCategoryId === -1) {
        showNotification('error', 'Please select a category');
        setIsLoading(false);
        return;
      }

      const response = await axios.post(
        `${getAdminApiUrl(companyId, '/categories/pasteItem')}`,
        {
          categoryId: currentCategoryId,
          newItems: selectedCategory?.items,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsLoading(false);
        return;
      }

      showNotification('success', response.data.message);
      setIsLoading(false);
      onClose();
    } catch (error: any) {
      console.log('Fail to paste items: ' + error);
      showNotification('error', 'Fail to paste items: ' + error);
      setIsLoading(false);
    }
  };

  const onChangeNewItem = (field: string, value: any, index: number) => {
    const selectedItem: any = newItems[index];

    selectedItem[field] = value;
    setNewItems((prevItems) => {
      return prevItems.map((item, i) => {
        if (i === index) {
          return selectedItem;
        }
        return item;
      });
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal maxHeight="80vh" overflow="scroll">
        <ModalHead
          heading="Paste Items"
          onClose={onClose}
          onClick={handlePasteItems}
          buttonProps={{ loading: isLoading }}
          buttonLabel="PASTE"
        />

        <Divider sx={{ my: 2 }} />

        <Box display="flex" flexDirection="column" gap={2}>
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="h6">Category</Typography>
            <Select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(+e.target.value)}
              size="small"
            >
              <MenuItem value={-1}>-- Select Category --</MenuItem>
              {categories &&
                categories.length > 0 &&
                categories.map((category, index) => (
                  <MenuItem key={index} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
            </Select>
          </Box>

          <Divider sx={{ my: 2 }}>Items</Divider>
          {selectedCategoryId === -1 ? (
            <ErrorComponent errorText="Please select a category" />
          ) : (
            selectedCategory?.items?.map((item, index: number) => (
              <Grid container key={index} spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Name"
                    value={item.name}
                    fullWidth
                    onChange={(e) =>
                      onChangeNewItem('name', e.target.value, index)
                    }
                  />
                </Grid>
                <Grid item xs={6} textAlign="right">
                  <TextField
                    label="Price"
                    value={item.price}
                    fullWidth
                    type="number"
                    onChange={(e) =>
                      onChangeNewItem('price', +e.target.value, index)
                    }
                  />
                </Grid>
              </Grid>
            ))
          )}
        </Box>
      </BoxModal>
    </Modal>
  );
}
