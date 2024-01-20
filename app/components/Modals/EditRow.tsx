import { customStyles } from '@/app/utils/styles';
import React, { ChangeEvent, Dispatch, SetStateAction, useState } from 'react';
import Modal from 'react-modal';
import Input from '../Input/Input';
import Button from '../Button/Button';
import { Notification, PositionType } from '@/app/utils/type';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';

interface PropTypes {
  handleChangePositionList: (
    positionId: number,
    field: string,
    value: any,
  ) => void;
  isOpen: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
  position: PositionType;
  setNotification: Dispatch<SetStateAction<Notification>>;
  value: number;
}

export default function EditRow({
  handleChangePositionList,
  isOpen,
  onChange,
  onClose,
  position,
  setNotification,
  value,
}: PropTypes) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateRow = async () => {
    setIsLoading(true);
    try {
      const response = await axios.put(API_URL.POSITION, {
        ...position,
        row: value,
      });
      const id = position.positionId as number;
      handleChangePositionList(id, 'row', value);
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
        onClick={updateRow}
        width="full"
        loadingButton
        isLoading={isLoading}
      />
    </Modal>
  );
}
