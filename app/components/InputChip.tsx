import React, {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import EditInputModal from './Modals/EditInputModal';
import { InputType, Notification } from '../utils/type';
import IconButton from './IconButton';
import DeleteModal from './Modals/DeleteModal';
import { API_URL } from '@/app/utils/enum';
import axios from 'axios';

interface PropTypes {
  className?: string;
  handleChangePositionList: (
    positionId: number,
    field: string,
    value: any,
  ) => void;
  id: string;
  input: InputType;
  position: any;
  setNotification: Dispatch<SetStateAction<Notification>>;
}

export default function InputChip({
  className,
  handleChangePositionList,
  id,
  input,
  position,
  setNotification,
}: PropTypes) {
  const [isDisableButton, setIsDisableButton] = useState<boolean>(false);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState<boolean>(false);
  const [isOpenEditModal, setIsOpenEditModal] = useState<boolean>(false);
  const [newInput, setNewInput] = useState<InputType>(input);
  const oldInput: InputType = input;

  useEffect(() => {
    if (
      oldInput.inputName === newInput.inputName &&
      oldInput.inputType === newInput.inputType
    ) {
      setIsDisableButton(true);
    } else {
      setIsDisableButton(false);
    }
  }, [newInput]);

  const generateIcon = (type: string) => {
    if (type === 'text') {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
      );
    }
    if (type === 'number') {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z"
          />
        </svg>
      );
    }

    if (type === 'date') {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
          />
        </svg>
      );
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `${API_URL.INPUT}?inputId=${input.inputId}`,
      );

      const newInputs = position.inputs.filter((inputObj: InputType) => {
        return inputObj.inputId !== input.inputId;
      });

      const id = position.positionId as number;
      handleChangePositionList(id, 'inputs', newInputs);

      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
      setIsOpenDeleteModal(false);
    } catch (error: any) {
      console.log(error);
      setNotification({
        on: true,
        type: 'success',
        message: error.response.data.error,
      });
    }
  };

  const handleSubmit = async () => {
    if (
      newInput.inputName === oldInput.inputName &&
      newInput.inputType === oldInput.inputType
    ) {
      return false;
    }
    try {
      const response = await axios.put(API_URL.INPUT, newInput);

      const newInputs = position.inputs.map((inputObj: InputType) => {
        if (inputObj.inputId === input.inputId) {
          return { ...response.data.data };
        }
        return inputObj;
      });

      const id = position.positionId as number;
      handleChangePositionList(id, 'inputs', newInputs);

      setIsOpenEditModal(false);
      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  return (
    <div
      id={id}
      className={`flex items-center justify-between h-auto bg-blue-50 text-black p-2 rounded-lg ${className}`}
    >
      <DeleteModal
        isOpen={isOpenDeleteModal}
        onClose={() => setIsOpenDeleteModal(false)}
        handleDelete={handleDelete}
      />
      <EditInputModal
        isDisableOnClick={isDisableButton}
        isOpen={isOpenEditModal}
        onClose={() => setIsOpenEditModal(false)}
        setInputName={(e: ChangeEvent<HTMLInputElement>) => {
          setNewInput({ ...newInput, inputName: e.target.value });
        }}
        setInputType={(e: ChangeEvent<HTMLSelectElement>) => {
          setNewInput({ ...newInput, inputType: e.target.value });
        }}
        inputName={newInput.inputName}
        inputType={newInput.inputType}
        handleSubmit={handleSubmit}
        title="Edit Input"
      />
      <div className="flex gap-2">
        {generateIcon(input.inputType)}
        <h1>{newInput.inputName}</h1>
      </div>
      <div className="text-right">
        <IconButton
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
              />
            </svg>
          }
          backgroundColor="blue"
          onClick={() => setIsOpenEditModal(true)}
        />
        <IconButton
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
          }
          backgroundColor="red"
          onClick={() => setIsOpenDeleteModal(true)}
        />
      </div>
    </div>
  );
}
