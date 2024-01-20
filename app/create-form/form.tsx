'use client';
import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { InputField, InsertPosition } from './type';
import { Notification } from '../utils/type';
import Button from '../components/Button/Button';
import Chip from '../components/Chip/Chip';
import Divider from '../components/Divider/Divider';
import Input from '../components/Input/Input';
import Navbar from '../components/Navbar/Navbar';
import NestedCheckbox from '../components/NestedCheckbox/NestedCheckbox';
import Select, { ValueType } from '../components/Select/Select';
import Snackbar from '../components/Snackbar/Snackbar';
import FadeIn from '../HOC/FadeIn';
import axios from 'axios';
import { API_URL } from '../utils/enum';
import { useSession } from 'next-auth/react';

export default function CreateForm() {
  const [disableInput, setDisableInput] = useState<boolean>(true);
  const [disableInsertPosition, setDisableInsertPosition] =
    useState<boolean>(true);
  const [disableAddForm, setDisableAddForm] = useState<boolean>(true);
  const [formName, setFormName] = useState<string>('');
  const [inputField, setInputField] = useState<InputField>({
    name: '',
    type: '',
    isChoose: true,
  });
  const [inputFieldList, setInputFieldList] = useState<InputField[]>([]);
  const [insertPosition, setInsertPosition] = useState<InsertPosition>({
    sheetName: '',
    row: 1,
    inputFields: [],
  });
  const [insertPositionList, setInsertPositionList] = useState<
    InsertPosition[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: '',
    message: '',
  });
  const [selectAll, setSelectAll] = useState<boolean>(true);
  const [sheetNames, setSheetNames] = useState<ValueType[]>([]);
  const { data: session, status }: any = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSheetsName();
    }
  }, [status]);

  // Logic handling is disable next field of form name or not
  useEffect(() => {
    if (formName.length > 0) {
      setDisableInput(false);
    } else {
      setDisableInput(true);
      setDisableInsertPosition(true);
      setDisableAddForm(true);
    }
  }, [formName]);

  // Logic handling is disable next field of input or not
  useEffect(() => {
    if (inputFieldList.length > 0) {
      setDisableInsertPosition(false);
    } else {
      setDisableInsertPosition(true);
      setDisableAddForm(true);
    }
  }, [inputFieldList]);

  // Logic handling is disable add form button or not
  useEffect(() => {
    if (insertPositionList.length > 0) {
      setDisableAddForm(false);
    } else {
      setDisableAddForm(true);
    }
  }, [insertPositionList]);

  // Logic for select all function
  useEffect(() => {
    if (selectAll) {
      setInputFieldList((prevList) => {
        return prevList.map((input) => {
          return {
            ...input,
            isChoose: true,
          };
        });
      });
    } else {
      setInputFieldList((prevList) => {
        return prevList.map((input) => {
          return {
            ...input,
            isChoose: false,
          };
        });
      });
    }
  }, [selectAll]);

  const fetchSheetsName = async () => {
    try {
      const response = await axios.get(API_URL.SHEETS);
      const data = response.data.data.map((sheet: string) => {
        return {
          value: sheet,
          label: sheet,
        };
      });
      setSheetNames(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddInputField = () => {
    if (!inputField.name || !inputField.type) {
      setNotification({
        on: true,
        type: 'error',
        message: 'You are missing either input name or input type',
      });
      return;
    }

    const isInputFieldInvalid = inputFieldList.some(
      (input) => input.name === inputField.name,
    );

    if (isInputFieldInvalid) {
      setNotification({
        on: true,
        type: 'error',
        message: `Name ${inputField.name} is already taken`,
      });
      return;
    }

    setInputFieldList([...inputFieldList, inputField]);
    setInputField({
      name: '',
      type: '',
      isChoose: true,
    });
    setNotification({
      on: true,
      type: 'success',
      message: 'Added Input Successfully',
    });
  };

  const handleAddForm = async () => {
    if (!session) {
      return;
    }
    setIsLoading(true);
    try {
      const submittedData = {
        formName,
        userId: session?.user?.id,
        positions: [...insertPositionList],
      };

      const response = await axios.post(API_URL.FORM, submittedData);

      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
      setFormName('');
      setIsLoading(false);
      setInputFieldList([]);
      setInsertPositionList([]);
    } catch (error: any) {
      console.log(error);
      setNotification({
        on: true,
        type: 'success',
        message: error.response.data.error,
      });
      setIsLoading(false);
    }
  };

  const handleAddPosition = () => {
    if (insertPosition.sheetName === '' || insertPosition.row < 1) {
      setNotification({
        on: true,
        type: 'error',
        message: 'You are missing either sheet name or row field',
      });
      return;
    }
    const isInsertFieldInvalid = insertPositionList.some((pos) => {
      return (
        pos.sheetName === insertPosition.sheetName &&
        pos.row == insertPosition.row
      );
    });
    if (isInsertFieldInvalid) {
      setNotification({
        on: true,
        type: 'error',
        message: `Sheet name ${insertPosition.sheetName} and row ${insertPosition.row} have already taken`,
      });
      return;
    }
    const insertInputFields = inputFieldList.filter(
      (input) => input.isChoose === true,
    );
    const validPos = {
      ...insertPosition,
      inputFields: [...insertInputFields],
    };
    setInsertPositionList([...insertPositionList, validPos]);
    setInsertPosition({
      sheetName: '',
      row: 1,
      inputFields: [],
    });
    setNotification({
      on: true,
      type: 'success',
      message: 'Added Position Successfully',
    });
  };

  const handleToggleIsChoose = (id: number) => {
    setInputFieldList((prevList) => {
      return prevList.map((input, index) => {
        if (id === index) {
          return {
            ...input,
            isChoose: !input.isChoose,
          };
        }
        return input;
      });
    });
  };

  const handleRemoveInputField = (e: MouseEvent, id: number) => {
    e.preventDefault();
    const newInputFieldList = inputFieldList.filter((_, index) => index !== id);
    setInputFieldList(newInputFieldList);
  };

  const handleRemoveInsertPosition = (e: MouseEvent, id: number) => {
    e.preventDefault();
    const newInsertPositionList = insertPositionList.filter(
      (_, index) => index !== id,
    );
    setInsertPositionList(newInsertPositionList);
  };

  return (
    <FadeIn>
      <Snackbar
        open={notification.on}
        onClose={() => setNotification({ ...notification, on: false })}
        type={notification.type}
        message={notification.message}
      />
      <Navbar isLogin={true} />
      <h2 className="mb-4 text-4xl text-center text-blue-600 font-bold">
        Create Form
      </h2>
      <div className="sm:mx-4 lg:mx-80 my-4">
        <Input
          label="Form Name"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setFormName(e.target.value);
          }}
          type="text"
          placeholder="Enter form name"
          value={formName}
        />
      </div>
      <Divider label="Inputs" />
      <div className="sm:mx-4 lg:mx-80 my-4">
        {inputFieldList.length > 0 &&
          inputFieldList.map((input, index) => {
            return (
              <Chip
                key={index}
                content={`Input Name: ${input.name}, Input type: ${input.type}`}
                handleRemove={(e: MouseEvent) =>
                  handleRemoveInputField(e, index)
                }
              />
            );
          })}
        <Input
          disabled={disableInput}
          label="Input Name (Label)"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setInputField({ ...inputField, name: e.target.value });
          }}
          type="text"
          placeholder="Enter input name"
          value={inputField.name}
        />
        <Select
          disabled={disableInput}
          description="Choose a data type"
          label="Input Type"
          value={inputField.type}
          onChange={(e) =>
            setInputField({ ...inputField, type: e.target.value })
          }
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
          color="blue"
          label="Add Input"
          onClick={handleAddInputField}
          width="full"
          disabled={disableInput}
        />
      </div>
      <Divider label="Insert Position" />
      <div className="sm:mx-4 lg:mx-80 my-4">
        {insertPositionList.length > 0 &&
          insertPositionList.map((insertPos, index) => {
            return (
              <Chip
                key={index}
                content={`Sheet Name: ${insertPos.sheetName}, Row: ${insertPos.row}`}
                handleRemove={(e: MouseEvent) =>
                  handleRemoveInsertPosition(e, index)
                }
              />
            );
          })}
        <Select
          disabled={disableInsertPosition}
          description="Choose a sheet name"
          label="Sheet Name"
          value={insertPosition.sheetName}
          onChange={(e) =>
            setInsertPosition({
              ...insertPosition,
              sheetName: e.target.value,
            })
          }
          values={sheetNames}
        />
        <Input
          disabled={disableInsertPosition}
          label="Row"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            if (insertPosition.row >= 0) {
              if (+e.target.value === 0) {
                return;
              }
              setInsertPosition({
                ...insertPosition,
                row: +e.target.value,
              });
            }
          }}
          type="number"
          placeholder="Enter row number"
          value={insertPosition.row}
        />
        <div>
          <h2 className="text-lg font-medium mb-4">
            Select fields to insert position
          </h2>
          <NestedCheckbox
            disabled={disableInsertPosition}
            checkboxList={inputFieldList}
            handleToggleCheckbox={handleToggleIsChoose}
            toggleAll={selectAll}
            handleToggleAll={setSelectAll}
          />
        </div>
        <Button
          color="blue"
          disabled={disableInsertPosition}
          label="Add Position"
          onClick={handleAddPosition}
          width="full"
        />
      </div>
      <div className="flex justify-center sm:mx-4 lg:mx-80">
        <Button
          disabled={disableAddForm}
          color="green"
          label="Add Form"
          isLoading={isLoading}
          loadingButton
          onClick={handleAddForm}
          width="full"
          className="my-2 bg-green-600 hover:bg-green-700"
        />
      </div>
    </FadeIn>
  );
}
