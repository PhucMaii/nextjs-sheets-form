import { customStyles } from '@/app/utils/styles';
import React, { Dispatch, SetStateAction } from 'react';
import Modal from 'react-modal';
import Button from '../Button/Button';
import Select from '../Select/Select';
import { FetchForm, Notification, PositionType } from '@/app/utils/type';

interface PropTypes {
  fetchForm: FetchForm;
  onChange: (e: any) => void;
  onClose: () => void;
  isOpen: boolean;
  position: PositionType;
  setNotification: Dispatch<SetStateAction<Notification>>;
  type: string;
  value: string;
  values: any;
}
Modal.setAppElement('#root');
export default function EditSheetName({
  fetchForm,
  onChange,
  onClose,
  isOpen,
  position,
  setNotification,
  type,
  value,
  values,
}: PropTypes) {
  const updateSheetName = async () => {
    try {
      const response = await fetch('/api/position', {
        method: 'PUT',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          ...position,
          sheetName: value,
        }),
      });
      const res = await response.json();
      await fetchForm(); // get the latest updated form with out refresh page
      setNotification({
        on: true,
        type: 'success',
        message: res.message,
      });
    } catch (error) {
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to update sheet name. Refresh page to see result',
      });
      console.log(error);
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} style={customStyles}>
      <h1 className="font-bold text-center text-lg mb-4">Edit Sheet Name</h1>
      <Select
        description="Change Sheet Name"
        label="Sheet Name"
        onChange={onChange}
        values={values}
        value={value}
      />
      <Button
        label="Save"
        color="blue"
        onClick={() => {
          updateSheetName();
          onClose();
        }}
        width="full"
      />
    </Modal>
  );
}
