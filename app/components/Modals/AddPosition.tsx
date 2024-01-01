import { customStyles } from '@/app/utils/styles';
import { FetchForm, Notification } from '@/app/utils/type';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import Modal from 'react-modal';
import Button from '../Button/Button';
import Input from '../Input/Input';
import Select, { ValueType } from '../Select/Select';

interface PropTypes {
  fetchForm: FetchForm;
  formId: string | null;
  isOpen: boolean;
  onClose: () => void;
  setNotification: Dispatch<SetStateAction<Notification>>;
}

export default function AddPosition({
  fetchForm,
  formId,
  isOpen,
  onClose,
  setNotification,
}: PropTypes) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sheetName, setSheetName] = useState<string>('');
  const [sheetNames, setSheetNames] = useState<ValueType[]>([]);
  const [row, setRow] = useState<number>(1);

  useEffect(() => {
    fetchSheetsName();
  }, []);

  const fetchSheetsName = async () => {
    try {
      const response = await fetch('/api/sheets', {
        method: 'GET',
        headers: {
          'Content-type': 'application/json',
        },
      });
      let data = await response.json();
      data = data.map((sheet: string) => {
        return {
          value: sheet,
          label: sheet,
        };
      });
      setSheetNames(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddPosition = async () => {
    setIsLoading(true);
    const data = { formId: Number(formId), sheetName, row };
    try {
      const response = await fetch('/api/position', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const pos = await response.json();
      await fetchForm();
      onClose();
      setNotification({
        on: true,
        type: 'success',
        message: pos.message,
      });
      setIsLoading(false);
    } catch (error: any) {
      console.log(error);
      setIsLoading(false);
      setNotification({
        on: true,
        type: 'error',
        message: error.message,
      });
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
        onClick={handleAddPosition}
        color="blue"
        width="full"
        loadingButton
        isLoading={isLoading}
      />
    </Modal>
  );
}
