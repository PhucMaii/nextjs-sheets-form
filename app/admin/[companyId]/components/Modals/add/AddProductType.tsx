import { AlertColor, Divider, Modal, TextField } from '@mui/material';
import React, { useState } from 'react';
import { BoxModal } from '../styled';
import { ModalProps } from '../type';
import ModalHead from '@/app/lib/ModalHead';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import SelectIcons from '../../Select/SelectIcons';
import { useParams } from 'next/navigation';
interface IProps extends ModalProps {
  showNotification: (type: AlertColor, message: string) => void;
}

export default function AddProductType({
  open,
  onClose,
  showNotification,
}: IProps) {
  const { companyId }: any = useParams();
  // const icons = Object.entries(LucideIcons).slice(0, 20);
  // const [displayIcons, setDisplayIcons] = useState<any[]>(icons);
  const [newProductType, setNewProductType] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // const [searchKeywords, setSearchKeywords] = useState<string>('');
  const [selectedIcon, setSelectedIcon] = useState<string>('');

  // const debouncedKeywords = useDebounce(searchKeywords, 1000);

  // useEffect(() => {
  //   if (debouncedKeywords) {
  //     const filteredIcons = Object.entries(LucideIcons).filter(([name]) => {
  //       return name.toLowerCase().includes(debouncedKeywords.toLowerCase());
  //     });

  //     setDisplayIcons(filteredIcons);
  //   } else {
  //     setDisplayIcons(icons);
  //   }
  // }, [debouncedKeywords]);

  const handleAddProductType = async () => {
    if (!newProductType || newProductType.trim() === '') {
      showNotification('error', 'Product Type Name is required');
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(
        getAdminApiUrl(companyId, '/productTypes'),
        {
          name: newProductType,
          icon: selectedIcon,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsLoading(false);
        return;
      }

      showNotification('success', response.data.message);
      onClose();
      setIsLoading(false);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', 'Internal Server Error: ' + error);

      setIsLoading(false);
      return;
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal maxHeight="80vh" overflow="scroll">
        <ModalHead
          heading="Add Product Type"
          buttonLabel="ADD"
          onClick={handleAddProductType}
          buttonProps={{ loading: isLoading }}
          onClose={onClose}
        />

        <Divider sx={{ my: 2 }} />
        <SelectIcons
          selectedIcon={selectedIcon}
          setSelectedIcon={setSelectedIcon}
        />
        <TextField
          label="Product Type"
          variant="outlined"
          fullWidth
          value={newProductType}
          onChange={(e) => setNewProductType(e.target.value)}
        />
      </BoxModal>
    </Modal>
  );
}
