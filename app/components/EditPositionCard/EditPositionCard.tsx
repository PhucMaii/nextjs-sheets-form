import { InputType, Notification, PositionType } from '../../utils/type';
import React, { Dispatch, SetStateAction, useState } from 'react';
import InputChip from '../DraggableChip/InputChip';
import Button from '../Button/Button';
import EditSheetName from '../Modals/EditSheetName';
import EditInputModal from '../Modals/EditInputModal';
import EditRow from '../Modals/EditRow';
import IconButton from '../IconButton/IconButton';

interface PropTypes {
  position: PositionType;
  sheetNames: any;
  handleChangePosition: (position: any, field: string, value: any) => void;
  setNotification: Dispatch<SetStateAction<Notification>>
}

export default function EditPositionCard({
  position,
  sheetNames,
  handleChangePosition,
  setNotification
}: PropTypes) {
  const [isOpenAddInput, setIsOpenAddInput] = useState<boolean>(false);
  const [isOpenEditSheetName, setIsOpenEditSheetName] =
    useState<boolean>(false);
  const [isOpenEditRow, setIsOpenEditRow] = useState<boolean>(false);
  const [newInput, setNewInput] = useState<InputType>({
    inputId: -1,
    inputName: '',
    inputType: '',
  });

  const handleSubmit = () => {
    const newInputList = [...position.inputs, newInput];
    handleChangePosition(position, 'inputs', newInputList);
    setNewInput({
      inputId: newInput.inputId - 1, // use negative number for temp id
      inputName: '',
      inputType: '',
    });
  };

  return (
    <div
      id={position.positionId.toString()}
      className="self-start flex-none min-w-max w-1/4 bg-blue-600 shadow rounded-lg p-4"
    >
      <EditSheetName
        isOpen={isOpenEditSheetName}
        onClose={() => setIsOpenEditSheetName(false)}
        type="text"
        value={position.sheetName}
        onChange={(e: any) =>
          handleChangePosition(position, 'sheetName', e.target.value)
        }
        values={sheetNames}
        position={position}
        setNotification={setNotification}
      />
      <EditRow
        isOpen={isOpenEditRow}
        onClose={() => setIsOpenEditRow(false)}
        value={position.row}
        onChange={(e) => handleChangePosition(position, 'row', +e.target.value)}
        position={position}
        setNotification={setNotification}
      />
      <EditInputModal
        handleSubmit={handleSubmit}
        isOpen={isOpenAddInput}
        inputType={newInput.inputType}
        inputName={newInput.inputName}
        onClose={() => setIsOpenAddInput(false)}
        placeholder="Enter input name"
        setInputName={(e: any) =>
          setNewInput({ ...newInput, inputName: e.target.value })
        }
        setInputType={(e: any) =>
          setNewInput({ ...newInput, inputType: e.target.value })
        }
        title="Add Input"
      />
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
          color="white"
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
          color="white"
          isBackgroundBold
          onClick={() => setIsOpenEditRow(true)}
        />
      </div>
      <div
        className="flex flex-col gap-4 my-4"
        id={position.positionId.toString()}
      >
        {position.inputs &&
          position.inputs.map((input, index) => {
            return (
              <InputChip
                key={input.inputId}
                position={position}
                id={input.inputId ? input.inputId.toString() : index.toString()}
                input={input}
                handleChangePosition={handleChangePosition}
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
      />
    </div>
  );
}
