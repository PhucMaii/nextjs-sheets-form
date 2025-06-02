import { Box, Divider, Modal, Tab, Tabs, Typography } from '@mui/material';
import React, { useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import GeneratePayroll from '../../GeneratePayroll';
import CreatePayroll from '../../CreatePayroll';

interface IProps extends ModalProps {}

export default function AddPayroll({ open, onClose }: IProps) {
  const [tab, setTab] = useState<'generate' | 'create'>('generate');
  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <ModalHead
          heading="Create Payroll"
          buttonLabel="Create"
          onClick={() => {}}
          buttonProps={{}}
          onClose={onClose}
        />

        <Divider sx={{ my: 2 }} />

        <Tabs
          value={tab}
          onChange={(e, value) => setTab(value)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
          variant="fullWidth"
        >
          <Tab label="Generate Payroll" value="generate" />
          <Tab label="Create Payroll" value="create" />
        </Tabs>

        <Box sx={{ mt: 2 }}>
          {tab === 'generate' && <GeneratePayroll />}

          {tab === 'create' && <CreatePayroll />}
        </Box>
      </BoxModal>
    </Modal>
  );
}
