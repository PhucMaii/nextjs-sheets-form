import { customStyles } from '@/app/utils/styles';
import { Notification } from '@/app/utils/type';
import React, { Dispatch, SetStateAction, useContext, useState } from 'react';
import Modal from 'react-modal';
import Button from '../Button/Button';
import Input from '../Input/Input';
import Select from '../Select/Select';
import { SheetNamesContext } from '@/app/context/SheetNamesContext';

interface PropTypes {
  handleAddPosition: (sheetName: string, row: number) => void;
  isOpen: boolean;
  onClose: () => void;
  setNotification: Dispatch<SetStateAction<Notification>>;
}

export default function AddPosition({
  handleAddPosition,
  isOpen,
  onClose,
  setNotification,
}: PropTypes) {
  const sheetNames = useContext(SheetNamesContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sheetName, setSheetName] = useState<any>();
  const [row, setRow] = useState<number>(1);

  const addPosition = async () => {
    setIsLoading(true);
    if (!sheetName) {
      setNotification({
        on: true,
        type: 'error',
        message: 'Sheet Name is required',
      });
      setIsLoading(false);
      return;
    }
    try {
      await handleAddPosition(sheetName, row);
      setSheetName('');
      setRow(1);
      setIsLoading(false);
    } catch (error: any) {
      console.log(error);
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} style={customStyles} onRequestClose={onClose}>
      <h1 className="font-bold text-center text-lg mb-4">Add Position</h1>
      <Select
        description="Choose a sheet name"
        label="Sheet Name"
        value={sheetName}
        onChange={(e) => setSheetName(e.target.value)}
        values={sheetNames}
      />
      <Input
        label="Row"
        onChange={(e) => {
          if (row >= 0) {
            if (+e.target.value === 0) {
              return;
            }
            setRow(+e.target.value);
          }
        }}
        type="number"
        placeholder="Enter row number"
        value={row}
      />
      <Button
        label="Add"
        onClick={addPosition}
        color="blue"
        width="full"
        loadingButton
        isLoading={isLoading}
      />
    </Modal>
  );
}
