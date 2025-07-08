import {
  Box,
  Checkbox,
  Divider,
  InputAdornment,
  Modal,
  OutlinedInput,
  Typography,
} from '@mui/material';
import React, { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { BoxModal } from '../styled';
import { ModalProps } from '../type';
import ModalHead from '@/app/lib/ModalHead';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import { useParams } from 'next/navigation';
import { SearchIcon } from 'lucide-react';
import useDebounce from '@/hooks/useDebounce';
import { IVendor } from '@/app/utils/type';

interface IProps extends ModalProps {
  selectedVendors: IVendor[];
  setSelectedVendors: Dispatch<SetStateAction<IVendor[]>>;
  fnOnSelect?: (vendors: IVendor[]) => void;
}

const VendorSelection = ({
  open,
  onClose,
  selectedVendors,
  setSelectedVendors,
  fnOnSelect,
}: IProps) => {
  const { companyId }: any = useParams();

  const [searchKeywords, setSearchKeywords] = useState<string>('');

  const debouncedKeywords = useDebounce(searchKeywords, 1000);

  const { data: vendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const response = await axios.get(getAdminApiUrl(companyId, '/vendors'));
      return response.data.data;
    },
  });

  const filteredVendors = useMemo(() => {
    if (debouncedKeywords) {
      return vendors?.filter((vendor: any) =>
        vendor.name.toLowerCase().includes(debouncedKeywords.toLowerCase()),
      );
    } else {
      return vendors;
    }
  }, [vendors, debouncedKeywords]);

  const onSelectVendor = (vendor: IVendor) => {
    const newSelectedVendors = [...selectedVendors];
    if (newSelectedVendors.some((v) => v.id === vendor.id)) {
      newSelectedVendors.splice(newSelectedVendors.indexOf(vendor), 1);
    } else {
      newSelectedVendors.push(vendor);
    }
    setSelectedVendors(newSelectedVendors);
    fnOnSelect?.(newSelectedVendors);
  };
  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal maxHeight="80vh" overflow="auto">
        <ModalHead
          heading="Vendor Selection"
          buttonLabel="Add Vendor"
          onClick={() => {}}
          buttonProps={{
            variant: 'contained',
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

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {filteredVendors?.map((vendor: any) => (
            <Box
              key={vendor.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <Typography>{vendor.name}</Typography>
              <Checkbox
                checked={selectedVendors.some((v) => v.id === vendor.id)}
                onChange={() => onSelectVendor(vendor)}
              />
            </Box>
          ))}
        </Box>
      </BoxModal>
    </Modal>
  );
};

export default VendorSelection;
