'use client';
import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { InputField } from './type';
import { Notification } from '../utils/type';
import Button from '../components/Button';
import Chip from '../components/Chip';
import Divider from '../components/Divider';
import Input from '../components/Input';
import Navbar from '../components/Navbar';
import Select from '../components/Select';
import Snackbar from '../components/Snackbar/Snackbar';
import FadeIn from '../HOC/FadeIn';
import axios from 'axios';
import { API_URL } from '../utils/enum';
import { useSession } from 'next-auth/react';

export default function CreateForm() {
  const [disableInput, setDisableInput] = useState<boolean>(true);
  const [disableAddForm, setDisableAddForm] = useState<boolean>(true);
  const [formName, setFormName] = useState<string>('');
  const [inputField, setInputField] = useState<InputField>({
    name: '',
    type: '',
  });
  const [inputFieldList, setInputFieldList] = useState<InputField[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: '',
    message: '',
  });
  const { data: session }: any = useSession();

  // Handling disable inserting input fields
  useEffect(() => {
    if (formName.length > 0) {
      setDisableInput(false);
    } else {
      setDisableInput(true);
      setDisableAddForm(true);
    }
  }, [formName]);

  // Handling disable add form button
  useEffect(() => {
    if (inputFieldList.length > 0) {
      setDisableAddForm(false);
    } else {
      setDisableAddForm(true);
    }
  }, [inputFieldList]);

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
        inputs: inputFieldList,
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

  const handleRemoveInputField = (e: MouseEvent, id: number) => {
    e.preventDefault();
    const newInputFieldList = inputFieldList.filter((_, index) => index !== id);
    setInputFieldList(newInputFieldList);
  };

  return (
    <FadeIn>
      <Snackbar
        open={notification.on}
        onClose={() => setNotification({ ...notification, on: false })}
        type={notification.type}
        message={notification.message}
      />
      <Navbar />
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
            {
              label: 'Date',
              value: 'date',
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
