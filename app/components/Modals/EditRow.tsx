import { customStyles } from '@/app/utils/styles';
import React, { Dispatch, SetStateAction } from 'react';
import Modal from 'react-modal';
import Input from '../Input/Input';
import Button from '../Button/Button';
import { FetchForm, Notification, PositionType } from '@/app/utils/type';

interface PropTypes {
  isOpen: boolean;
  onClose: () => void;
  value: number;
  onChange: (e: any) => void;
  position: PositionType;
  setNotification: Dispatch<SetStateAction<Notification>>;
  fetchForm: FetchForm;
}

export default function EditRow({
  isOpen,
  onClose,
  value,
  onChange,
  position,
  setNotification,
  fetchForm,
}: PropTypes) {
  const updateRow = async () => {
    try {
      const response = await fetch('/api/position', {
        method: 'PUT',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          ...position,
          row: value,
        }),
      });
      const res = await response.json();
      await fetchForm();
      setNotification({
        on: true,
        type: 'success',
        message: res.message,
      });
    } catch (error) {
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to update row. Refresh page to see result',
      });
      console.log(error);
    }
  };
  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} style={customStyles}>
      <h1 className="font-bold text-center text-lg mb-4">Edit Start Row</h1>
      <Input<number>
        label="Row"
        onChange={onChange}
        value={value}
        type="number"
        placeholder="Enter row"
      />
      <Button
        label="Save"
        color="blue"
        onClick={() => {
          updateRow();
          onClose();
        }}
        width="full"
      />
    </Modal>
  );
}
