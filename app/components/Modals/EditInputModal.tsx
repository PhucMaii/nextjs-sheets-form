import { customStyles } from '@/app/utils/styles';
import React, { ChangeEvent, useState } from 'react';
import Modal from 'react-modal';
import Input from '../Input/Input';
import Select from '../Select/Select';
import Button from '../Button/Button';
import { Notification } from '@/app/utils/type';

interface PropTypes {
  isDisableOnClick?: boolean;
  handleSubmit: () => any;
  inputName: string;
  inputType: string;
  isOpen: boolean;
  onClose: () => void;
  placeholder?: string;
  setInputName: (e: ChangeEvent<HTMLInputElement>) => void;
  setInputType: (e: ChangeEvent<HTMLSelectElement>) => void;
  title: string;
}
Modal.setAppElement('#root');

export default function EditInputModal({
  isDisableOnClick,
  handleSubmit,
  inputName,
  inputType,
  isOpen,
  onClose,
  placeholder,
  setInputName,
  setInputType,
  title,
}: PropTypes) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: '',
    message: '',
  });
  const handleAddInput = async () => {
    setIsLoading(true);
    if (inputName === '' || inputType === '') {
      setNotification({
        on: true,
        type: 'error',
        message: 'Please Fill Out All Blanks',
      });
      setIsLoading(false);
      return;
    }
    const isValid = await handleSubmit();
    if (!isValid) {
      setNotification({
        on: true,
        type: 'error',
        message: 'Input Name Exist',
      });
    }
    setIsLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      style={customStyles}
      onRequestClose={() => {
        onClose();
        setNotification({ on: false, type: '', message: '' });
      }}
    >
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
      <Button
        label="Save"
        color="blue"
        onClick={handleAddInput}
        width="full"
        loadingButton
        isLoading={isLoading}
        disabled={isDisableOnClick ? isDisableOnClick : false}
      />
    </Modal>
  );
}
