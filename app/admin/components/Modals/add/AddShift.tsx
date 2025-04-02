// app/admin/components/Modals/add/AddShift.tsx
import { Divider, MenuItem, Modal, Select, Typography } from '@mui/material';
import { BoxModal } from '../styled';
import { ModalProps } from '../type';
import ModalHead from '@/app/lib/ModalHead';
import { useEffect, useState } from 'react';
import { IDriver } from '@/app/utils/type';

interface IProps extends ModalProps {
  drivers: IDriver[];
}

export const AddShift = ({ open, onClose, drivers }: IProps) => {
  const [allDrivers, setAllDrivers] = useState<any>([]);
  const [newShift, setNewShift] = useState<any>({
    driverId: -1,
    startTime: '',
    endTime: '',
    date: '',
  });
  const [selectedDriverId, setSelectedDriverId] = useState<number>(-1);

  useEffect(() => {
    if (drivers) {
      setAllDrivers(drivers);
    }
  }, [drivers]);

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <ModalHead
          heading="Add Shift"
          buttonLabel="ADD"
          onClose={onClose}
          onClick={() => {}}
          buttonProps={{}}
        />

        <Divider sx={{ my: 2 }} />

        <Typography>Select Driver</Typography>
        <Select
          fullWidth
          value={selectedDriverId}
          onChange={(e) => setSelectedDriverId(+e.target.value)}
          sx={{ mt: 1 }}
        >
          <MenuItem value={-1}>All</MenuItem>
          {allDrivers.map((driver: any) => (
            <MenuItem value={driver.id} key={driver.id}>
              <Typography>{driver.name}</Typography>
            </MenuItem>
          ))}
        </Select>
      </BoxModal>
    </Modal>
  );
};
