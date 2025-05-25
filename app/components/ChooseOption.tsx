import { Divider, Grid, Modal } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { BoxModal } from '@/app/admin/[companyId]/components/Modals/styled';
import ModalHead from '@/app/lib/ModalHead';
import { primaryColor } from '@/theme/color';
import { ItemButton } from './OrderView';
import { grey } from '@mui/material/colors';

interface IProps {
  open: boolean;
  onClose: () => void;
  options: any[];
  onAddOption: any;
}
export default function ChooseOption({ open, onClose, options, onAddOption }: IProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<any>(options[0]);

  const handleAddOption = async (e: any, option: any) => {
    setIsLoading(true);
    await onAddOption(e, option);
    setIsLoading(false);
  };


  useEffect(() => {
    setSelectedOption(options[0]);
  }, [options]);

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <ModalHead
          heading="Choose Option"
          onClose={onClose}
          buttonLabel="Choose"
          onClick={(e: any) => handleAddOption(e, selectedOption)}
          buttonProps={{
            loading: isLoading,
          }}
        />

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          {options.map((option, index: number) => (
            <Grid item xs={6} md={4} lg={3} key={index}>
              <ItemButton
                item={option}
                onClick={() => setSelectedOption(option)}
                containerStyle={{
                  backgroundColor: grey[100],
                  border: `3px solid ${selectedOption?.id === option.id ? primaryColor : 'transparent'}`,
                }}
              />
            </Grid>
          ))}
        </Grid>
      </BoxModal>
    </Modal>
  );
}
