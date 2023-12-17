import { customStyles } from '@/app/utils/styles';
import React, { useState } from 'react';
import Modal from 'react-modal';
import Input from '../Input/Input';
import Select from '../Select/Select';
import Button from '../Button/Button';
import { Notification } from '@/app/utils/type';

interface PropTypes {
  isOpen: boolean;
  onClose: () => void;
  inputName: string;
  inputType: string;
  placeholder?: string;
  setInputName: (e: any) => void;
  setInputType: (e: any) => void;
  handleSubmit: () => void;
  title: string;
}
Modal.setAppElement('#root');
export default function EditInputModal({
  isOpen,
  onClose,
  inputName,
  inputType,
  placeholder,
  setInputName,
  setInputType,
  handleSubmit,
  title,
}: PropTypes) {
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: '',
    message: '',
  });
  const handleAddInput = async () => {
    if (inputName === '' || inputType === '') {
      setNotification({
        on: true,
        type: 'error',
        message: 'Please Fill Out All Blanks',
      });
      return;
    }
    handleSubmit();
    onClose();
  };
  return (
    <Modal isOpen={isOpen} style={customStyles} onRequestClose={onClose}>
      <h1 className="font-bold text-center text-lg mb-4">{title}</h1>
      {notification.on && (
        <div
          className="flex items-center w-full p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50"
          role="alert"
        >
          <svg
            className="flex-shrink-0 inline w-4 h-4 me-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
          </svg>
          <div>
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}
      <Input<string>
        label="Input Name"
        onChange={setInputName}
        placeholder={placeholder ? placeholder : ''}
        value={inputName}
        type="text"
      />
      <Select
        description="Choose a data type"
        label="Input Type"
        value={inputType}
        onChange={setInputType}
        values={[
          {
            label: 'Text',
            value: 'text',
          },
          {
            label: 'Number',
            value: 'number',
          },
        ]}
      />
      <Button label="Save" color="blue" onClick={handleAddInput} width="full" />
    </Modal>
  );
}
