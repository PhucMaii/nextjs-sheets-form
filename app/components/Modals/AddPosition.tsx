import { customStyles } from '@/app/utils/styles';
import { FetchForm, Notification } from '@/app/utils/type';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import Modal from 'react-modal';
import Button from '../Button/Button';
import Input from '../Input/Input';
import Select, { ValueType } from '../Select/Select';

interface PropTypes {
  fetchForm: FetchForm;
  handleAddPosition: (sheetName: string, row: number) => void;
  isOpen: boolean;
  onClose: () => void;
  setNotification: Dispatch<SetStateAction<Notification>>;
}

export default function AddPosition({
  fetchForm,
  handleAddPosition,
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

  useEffect(() => {
    if (sheetName === '') {
      fetchForm();
    }
  }, [sheetName]);

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
