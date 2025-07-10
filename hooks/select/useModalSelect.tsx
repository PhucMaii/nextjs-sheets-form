import { BoxModal } from '@/app/admin/[companyId]/components/Modals/styled';
import ModalHead from '@/app/lib/ModalHead';
import {
  Checkbox,
  Box,
  Divider,
  InputAdornment,
  Modal,
  OutlinedInput,
  Typography,
} from '@mui/material';
import { SearchIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const ModalSelection = ({
  open,
  onClose,
  selectedItems,
  setSelectedItems,
  itemList,
  label,
  fnOnSelect,
}: {
  open: boolean;
  onClose: () => void;
  selectedItems: any[];
  setSelectedItems: (items: any[]) => void;
  itemList: any[];
  label: string;
  fnOnSelect?: (items: any[]) => void;
}) => {
  const [searchKeywords, setSearchKeywords] = useState('');

  const filteredItems = useMemo(
    () =>
      itemList.filter((item) =>
        item.name.toLowerCase().includes(searchKeywords.toLowerCase()),
      ),
    [itemList, searchKeywords],
  );

  const onSelectItem = (item: any) => {
    let newSelectedItems = [...selectedItems];
    if (newSelectedItems.some((v) => v.id === item.id)) {
      newSelectedItems = newSelectedItems.filter((v) => v.id !== item.id);
    } else {
      newSelectedItems.push(item);
    }
    setSelectedItems(newSelectedItems);
    fnOnSelect?.(newSelectedItems);
  };

  const onSelectAllItems = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
      fnOnSelect?.([]);
    } else {
      setSelectedItems(filteredItems);
      fnOnSelect?.(filteredItems);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal maxHeight="80vh" overflow="auto">
        <ModalHead
          heading={label}
          buttonLabel="Select"
          onClick={() => {}}
          buttonProps={{
            color: 'primary',
          }}
          onClose={onClose}
          onlyHeading
        />
        <Divider sx={{ my: 1 }} />

        <OutlinedInput
          placeholder="Search Vendor"
          fullWidth
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          }
          value={searchKeywords}
          onChange={(e) => setSearchKeywords(e.target.value)}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              mb: 1,
            }}
          >
            <Typography variant="body2">Select All</Typography>
            <Checkbox
              checked={selectedItems.length === filteredItems.length}
              onChange={() => onSelectAllItems()}
            />
          </Box>
          {filteredItems?.map((item: any) => (
            <Box
              key={item.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <Typography>{item.name}</Typography>
              <Checkbox
                checked={selectedItems.some((v) => v.id === item.id)}
                onChange={() => onSelectItem(item)}
              />
            </Box>
          ))}
        </Box>
      </BoxModal>
    </Modal>
  );
};

const useModalSelect = (
  label: string,
  itemList: any[],
  fnOnSelect?: (items: any[]) => void,
  defaultSelectedItems?: any[] | null,
) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<any[]>(
    defaultSelectedItems || [],
  );

  useEffect(() => {
    if (defaultSelectedItems) {
      setSelectedItems(defaultSelectedItems);
    }
  }, [defaultSelectedItems]);

  const handleOpen = () => {
    setIsOpen(true);
  };
  const handleClose = () => {
    setIsOpen(false);
  };

  const SelectionModal = () => {
    return (
      <ModalSelection
        open={isOpen}
        onClose={() => setIsOpen(false)}
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
        itemList={itemList}
        label={label}
        fnOnSelect={fnOnSelect}
      />
    );
  };

  return {
    isOpen,
    selectedItems,
    setSelectedItems,
    SelectionModal,
    handleOpen,
    handleClose,
  };
};

export default useModalSelect;
