import { BoxModal } from '@/app/admin/components/Modals/styled';
import { ModalProps } from '@/app/admin/components/Modals/type';
import ModalHead from '@/app/lib/ModalHead';
import { API_URL } from '@/app/utils/enum';
import { IDriver } from '@/app/utils/type';
import { AlertColor, Divider, FormControl, MenuItem, Modal, OutlinedInput, Select, TextField, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

interface IProps extends ModalProps {
    showNotification: (type: AlertColor, message: string) => void;
}

export default function AddRoom({open, onClose, showNotification}: IProps) {
    const [driverList, setDriverList] = useState<any[]>([]);
    const [newName, setNewName] = useState<string>('');
    const [selectedDrivers, setSelectedDrivers] = useState<IDriver[]>([]);

    useEffect(() => {
        fetchDriverList();
    }, []);

    const fetchDriverList = async () => {
        try {
            const response = await axios.get(`${API_URL.DRIVER}/allDrivers`);

            if (response.data.error) {
                showNotification('error', response.data.error);
                return;
            }

            setDriverList(response.data.data);
        } catch (error: any) {
            console.log('Internal Server Error: ', error);
        }
    }

    const handleChange = (event: any) => {
        const {
          target: { value },
        } = event;

        console.log(value, 'value');
        setSelectedDrivers(
          // On autofill we get a stringified value.
          typeof value === 'string' ? value.split(',') : value,
        );
    };
    
  return (
   <Modal open={open} onClose={onClose}>
        <BoxModal display={"flex"} flexDirection={"column"} gap={1}>
            <ModalHead 
                heading="Add Room" 
                buttonLabel="Add" 
                onClose={onClose} 
                onClick={() => {}} 
                buttonProps={{}} 
            />
            <Divider sx={{my: 2}} />

            <Typography variant="subtitle1">Name</Typography>
            <TextField 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
            />

            <Typography variant="subtitle1">Members</Typography>
            <FormControl>
                <Select
                    label="Members"
                    multiple
                    value={selectedDrivers}
                    onChange={handleChange}
                    input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                >
                    {
                        driverList.length > 0 && driverList.map((driver) => (
                            <MenuItem
                                key={driver.id}
                                value={driver}
                            >
                                {driver.name}
                            </MenuItem>
                        ))
                    }

                </Select>
            </FormControl>
        </BoxModal>    
   </Modal>
  )
}
