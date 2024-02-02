import { customStyles } from '@/app/utils/styles';
import React, { ChangeEvent, Dispatch, SetStateAction, useState } from 'react';
import Modal from 'react-modal';
import Button from '../Button/Button';
import Select, { ValueType } from '../Select/Select';
import { Notification, PositionType } from '@/app/utils/type';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';

interface PropTypes {
  handleChangePositionList: (
    positionId: number,
    field: string,
    value: any,
  ) => void;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  onClose: () => void;
  isOpen: boolean;
  position: PositionType;
  setNotification: Dispatch<SetStateAction<Notification>>;
  value: string;
  values: ValueType[];
}
Modal.setAppElement('#root');
export default function EditSheetName({
  handleChangePositionList,
  onChange,
  onClose,
  isOpen,
  position,
  setNotification,
  value,
  values,
}: PropTypes) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateSheetName = async () => {
    setIsLoading(true);
    try {
      const response = await axios.put(API_URL.POSITION, {
        ...position,
        sheetName: value,
      });
      const id = position.positionId as number;

      handleChangePositionList(id, 'sheetName', value);

      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
      setIsLoading(false);

      onClose();
    } catch (error: any) {
      setNotification({
        on: true,
        type: 'error',
        message: error.response.data.error,
      });
      setIsLoading(false);
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
        onClick={updateSheetName}
        width="full"
        loadingButton
        isLoading={isLoading}
      />
    </Modal>
  );
}
