'use client';
import {
  FetchForm,
  InputType,
  Notification,
  PositionType,
} from '../../utils/type';
import React, { ChangeEvent, Dispatch, SetStateAction, useState } from 'react';
import InputChip from '../DraggableChip/InputChip';
import Button from '../Button/Button';
import EditSheetName from '../Modals/EditSheetName';
import EditInputModal from '../Modals/EditInputModal';
import EditRow from '../Modals/EditRow';
import IconButton from '../IconButton/IconButton';
import { ValueType } from '../Select/Select';
import DeleteModal from '../Modals/DeleteModal';

interface PropTypes {
  fetchForm: FetchForm;
  position: PositionType;
  setNotification: Dispatch<SetStateAction<Notification>>;
  sheetNames: ValueType[];
}

export default function EditPositionCard({
  fetchForm,
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

  const handleAddInput = async () => {
    try {
      const response = await fetch('/api/input', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify(newInput),
      });
      const res = await response.json();
      await fetchForm(); // get the latest updated form without refresh the page
      setNewInput({
        positionId: position.positionId,
        inputId: newInput.inputId - 1, // use negative number for temp id
        inputName: '',
        inputType: '',
      });
      setNotification({
        on: true,
        type: 'success',
        message: res.message,
      });
    } catch (error) {
      console.log(error);
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to add input',
      });
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `/api/position?positionId=${position.positionId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-type': 'applicaiton/json',
          },
        },
      );

      const res = await response.json();
      await fetchForm();
      setNotification({
        on: true,
        type: res.error ? 'error' : 'success',
        message: res.error || res.message,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      id={position.positionId?.toString()}
      className="relative self-start flex-none min-w-max w-1/4 bg-blue-600 shadow rounded-lg p-4"
    >
      <DeleteModal
        isOpen={isOpenDeleteModal}
        onClose={() => setIsOpenDeleteModal(false)}
        handleDelete={handleDelete}
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
        fetchForm={fetchForm}
      />
      <EditRow
        isOpen={isOpenEditRow}
        onClose={() => setIsOpenEditRow(false)}
        value={row}
        onChange={(e) => setRow(+e.target.value)}
        position={position}
        setNotification={setNotification}
        fetchForm={fetchForm}
      />
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
                input={input}
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
        className="hover:bg-blue-800 rounded-lg"
      />
    </div>
  );
}
