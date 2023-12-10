import { InputType, Position } from '@/app/form/[id]/type';
import React, { useState } from 'react';
import Input from '../Input/Input';
import InputChip from '../DraggableChip/InputChip';
import Button from '../Button/Button';
import EditSheetName from '../Modals/EditSheetName';
import EditInputModal from '../Modals/EditInputModal';

interface PropTypes {
  position: Position;
  sheetNames: any;
  handleChangePosition: (position: any, field: string, value: any) => void
}

export default function EditPositionCard({
  position,
  sheetNames,
  handleChangePosition
}: PropTypes) {
  const [isOpenEditSheetName, setIsOpenEditSheetName] = useState<boolean>(false);
  const [isOpenAddInput, setIsOpenAddInput] = useState<boolean>(false);
  const [newInput, setNewInput] = useState<InputType>({
    input_id: -1,
    input_name: '',
    input_type: ''
  });

  const handleSubmit = () => {
    const newInputList = [...position.inputs, newInput];
    handleChangePosition(position, 'inputs', newInputList);
    setNewInput({
      input_id: newInput.input_id - 1, // use negative number for temp id
      input_name: '',
      input_type: ''
    })
  }
  return (
    <div
      id={position.position_id.toString()}
      className="flex-none min-w-max w-1/4 bg-blue-600 shadow rounded-lg p-4"
    >
      <EditSheetName
        isOpen={isOpenEditSheetName}
        onClose={() => setIsOpenEditSheetName(false)}
        type="text"
        value={position.sheet_name}
        onChange={(e: any) => handleChangePosition(position, 'sheet_name', e.target.value)}
        values={sheetNames}
      />
      <EditInputModal 
        handleSubmit={handleSubmit}
        isOpen={isOpenAddInput}
        inputType={newInput.input_type}
        inputName={newInput.input_name}
        onClose={() => setIsOpenAddInput(false)}
        placeholder="Enter input name"
        setInputName={(e: any) => setNewInput({...newInput, input_name: e.target.value})}
        setInputType={(e: any) => setNewInput({...newInput, input_type: e.target.value})}
        title="Add Input"
      />
      <div className="flex items-center gap-2">
        <h1 className="text-white font-bold text-lg">{position.sheet_name}</h1>
        <button
          className="inline-block text-blue-500 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-200 rounded-lg text-sm p-1.5"
          onClick={() => setIsOpenEditSheetName(true)}
        >
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
        </button>
      </div>
      <div className="flex items-center gap-2">
        <h1 className="text-white font-bold text-lg">Start Row:</h1>
        <Input<number>
          onChange={(e: any) => handleChangePosition(position, 'row', +e.target.value)}
          type="number"
          placeholder="Row"
          value={position.row}
          className="mb-0"
        />
      </div>
      <div
        className="flex flex-col gap-4 my-4"
        id={position.position_id.toString()}
      >
        {position.inputs &&
          position.inputs.map((input, index) => {
            return (
              <InputChip
                key={input.input_id}
                position={position}
                id={input.input_id ? input.input_id.toString() : index.toString()}
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
      <Button
        disabled={false}
        color="green"
        label="Save"
        onClick={() => {}}
        width="full"
        className="mt-4"
      />
    </div>
  );
}
