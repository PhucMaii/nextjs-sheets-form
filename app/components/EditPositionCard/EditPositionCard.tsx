'use client';
import {
  FetchForm,
  InputType,
  Notification,
  PositionType,
} from '../../utils/type';
import React, {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import InputChip from '../DraggableChip/InputChip';
import Button from '../Button/Button';
import EditSheetName from '../Modals/EditSheetName';
import EditInputModal from '../Modals/EditInputModal';
import EditRow from '../Modals/EditRow';
import IconButton from '../IconButton/IconButton';
import { ValueType } from '../Select/Select';
import DeleteModal from '../Modals/DeleteModal';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';

interface OwnPositionType extends PositionType {
  positionId: number;
}

interface PropTypes {
  fetchForm: FetchForm;
  handleChangePositionList: (
    positionId: number,
    field: string,
    value: any,
  ) => void;
  handleDeletePos: (positionId: number) => void;
  position: OwnPositionType;
  setNotification: Dispatch<SetStateAction<Notification>>;
  sheetNames: ValueType[];
}

export default function EditPositionCard({
  fetchForm,
  handleChangePositionList,
  handleDeletePos,
  position,
  setNotification,
  sheetNames,
}: PropTypes) {
  const [isOpenAddInput, setIsOpenAddInput] = useState<boolean>(false);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState<boolean>(false);
  const [isOpenEditSheetName, setIsOpenEditSheetName] =
    useState<boolean>(false);
  const [isOpenEditRow, setIsOpenEditRow] = useState<boolean>(false);
  const [newInput, setNewInput] = useState<InputType>({
    positionId: position.positionId,
    inputId: -1,
    inputName: '',
    inputType: '',
  });
  const [sheetName, setSheetName] = useState<string>(position.sheetName);
  const [row, setRow] = useState<number>(position.row);

  useEffect(() => {
    if (
      newInput.positionId === position.positionId &&
      newInput.inputId === -1 &&
      newInput.inputName === '' &&
      newInput.inputType === ''
    ) {
      fetchForm();
    }
  }, [newInput]);

  const handleAddInput = async () => {
    try {
      const response = await axios.post(API_URL.INPUT, newInput);
      const id: number = position.positionId as number;
      handleChangePositionList(id, 'inputs', [...position.inputs, newInput]);

      setNewInput({
        positionId: position.positionId,
        inputId: -1, // use negative number for temp id
        inputName: '',
        inputType: '',
      });
      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
      setIsOpenAddInput(false);

      return true;
    } catch (error) {
      await fetchForm();
      console.log(error);
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to add input',
      });
      return false;
    }
  };

  return (
    <div
      id={position.positionId?.toString()}
      className="relative self-start flex-none min-w-max w-1/4 bg-blue-500 shadow rounded-lg p-4"
    >
      <DeleteModal
        isOpen={isOpenDeleteModal}
        onClose={() => setIsOpenDeleteModal(false)}
        handleDelete={() => handleDeletePos(position.positionId)}
      />
      <EditSheetName
        isOpen={isOpenEditSheetName}
        onClose={() => setIsOpenEditSheetName(false)}
        value={sheetName}
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          setSheetName(e.target.value)
        }
        values={sheetNames}
        position={position}
        setNotification={setNotification}
        handleChangePositionList={handleChangePositionList}
      />
      <EditRow
        handleChangePositionList={handleChangePositionList}
        isOpen={isOpenEditRow}
        onClose={() => setIsOpenEditRow(false)}
        value={row}
        onChange={(e) => setRow(+e.target.value)}
        position={position}
        setNotification={setNotification}
      />
      {/* Add Input Modal */}
      <EditInputModal
        handleSubmit={handleAddInput}
        isOpen={isOpenAddInput}
        inputType={newInput.inputType}
        inputName={newInput.inputName}
        onClose={() => setIsOpenAddInput(false)}
        placeholder="Enter input name"
        setInputName={(e: ChangeEvent<HTMLInputElement>) =>
          setNewInput({ ...newInput, inputName: e.target.value })
        }
        setInputType={(e: ChangeEvent<HTMLSelectElement>) =>
          setNewInput({ ...newInput, inputType: e.target.value })
        }
        title="Add Input"
      />
      <div className="flex justify-end w-full">
        <Button
          className="bg-red-400 rounded-lg p-0 hover:bg-red-500"
          label="x"
          color=""
          onClick={() => setIsOpenDeleteModal(true)}
          width="auto"
        />
      </div>
      <div className="flex items-center gap-2">
        <h1 className="text-white font-bold text-lg">{position.sheetName}</h1>
        <IconButton
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="white"
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
          isBackgroundBold
          onClick={() => setIsOpenEditSheetName(true)}
        />
      </div>
      <div className="flex items-center gap-2">
        <h1 className="text-white font-bold text-lg">
          Start Row: {position.row}
        </h1>
        <IconButton
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="white"
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
          isBackgroundBold
          onClick={() => setIsOpenEditRow(true)}
        />
      </div>
      <div
        className="flex flex-col gap-4 my-4"
        id={position.positionId?.toString()}
      >
        {position.inputs &&
          position.inputs.map((input, index) => {
            return (
              <InputChip
                key={input.inputId}
                id={input.inputId ? input.inputId.toString() : index.toString()}
                handleChangePositionList={handleChangePositionList}
                input={input}
                position={position}
                fetchForm={fetchForm}
                setNotification={setNotification}
              />
            );
          })}
      </div>
      <Button
        color="blue"
        label="+ Add Input"
        onClick={() => setIsOpenAddInput(true)}
        width="full"
        justify="start"
        className="hover:bg-blue-800 rounded-lg shadow-none"
      />
    </div>
  );
}
