'use client';
import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FormType, Notification, SessionClientType } from '@/app/utils/type';
import Button from '@/app/components/Button/Button';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import Navbar from '@/app/components/Navbar/Navbar';
import Snackbar from '@/app/components/Snackbar/Snackbar';
import { InputType, InputValues, PositionType } from '../../utils/type';
import Input from '@/app/components/Input/Input';
import FadeIn from '@/app/HOC/FadeIn';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';

export default function Form() {
  const [formData, setFormData] = useState<FormType>({
    userId: 0,
    formId: 0,
    formName: '',
    lastOpened: new Date(),
  });
  const [inputList, setInputList] = useState<InputType[]>([]);
  const [inputValues, setInputValues] = useState<InputValues>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(true);
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: '',
    message: '',
  });
  const [positionList, setPositionList] = useState<PositionType[]>([]);
  const { id }: { id: string | null } = useParams() as { id: string | null };
  const { data: session, status }: SessionClientType =
    useSession() as SessionClientType;
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      fetchForm();
    }
  }, [status]);

  const fetchForm = async () => {
    try {
      const response = await axios.get(`${API_URL.FORM}?id=${id}`);
      const data = response.data.data;

      if (parseInt(session?.user?.id as string) !== data.userId) {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      getMostInputsPosition(data);
      setPositionList(data.positions);
      setFormData(data);
      setIsLoading(false);
    } catch (error: unknown) {
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to fetch data',
      });
      console.log(error);
    }
  };

  const getMostInputsPosition = (data: FormType) => {
    const positionList = data.positions;
    let newInputList: InputType[] = [];
    const uniqueInputIds = new Set<string>();
    if (!positionList) {
      return;
    }
    newInputList = positionList
      .map((position: PositionType) => {
        return position.inputs.filter((input: InputType) => {
          if (!uniqueInputIds.has(input.inputName)) {
            uniqueInputIds.add(input.inputName);
            return true;
          }
          return false;
        });
      })
      .flat();
    createInputValues(newInputList);
    setInputList(newInputList.flat());
  };

  const createInputValues = (inputs: InputType[]) => {
    const newInputValues: InputValues = {};
    for (const input of inputs) {
      if (input.inputType === 'text') {
        newInputValues[input.inputName] = '';
      } else {
        newInputValues[input.inputName] = 0;
      }
    }
    setInputValues(newInputValues);
  };

  const handleSubmit = async (e: MouseEvent) => {
    e.preventDefault();
    setIsButtonLoading(true);
    try {
      const submitForm = positionList.map((pos) => {
        const validInputs: InputValues = {};
        for (const input of pos.inputs) {
          validInputs[input.inputName] = inputValues[input.inputName];
        }
        return {
          sheetName: pos.sheetName,
          row: pos.row,
          ...validInputs,
        };
      });
      const response = await axios.post(API_URL.IMPORT_SHEETS, submitForm);
      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
      setIsButtonLoading(false);
    } catch (error: any) {
      console.log(error);
      setNotification({
        on: true,
        type: 'error',
        message: error.response.data.error,
      });
      setIsButtonLoading(false);
    }
  };

  if (isLoading || status === 'loading') {
    return (
      <div className="flex flex-col gap-8 justify-center items-center pt-8 h-screen">
        <LoadingComponent color="blue" width="12" height="12" />
      </div>
    );
  }

  // If this form is not created by that user
  if (!isAuthorized) {
    return (
      <div className="bg-red-100 p-20 w-full h-full flex flex-col justify-center items-center gap-8">
        <h1 className="text-2xl text-red-800 font-bold text-center">
          Sorry You Do Not Have Access To This Page
        </h1>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-10 h-10"
        >
          <path
            className="text-red-600"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
        <Button
          color="blue"
          label="Back Home"
          onClick={() => router.push('/')}
          width="auto"
        />
      </div>
    );
  }

  return (
    <FadeIn>
      <Snackbar
        open={notification.on}
        onClose={() => setNotification({ ...notification, on: false })}
        type={notification.type}
        message={notification.message}
      />
      <Navbar isLogin={true} />
      <div className="max-w-2xl mx-auto py-16">
        <h4 className="text-center font-bold text-2xl text-blue-600 px-8">
          {formData.formName}
        </h4>
        <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          {inputList.length > 0 &&
            inputList.map((input, index) => {
              return (
                <Input<string | number>
                  key={index}
                  label={input.inputName}
                  type={input.inputType}
                  value={inputValues[input.inputName]}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setInputValues((prevInputValues) => {
                      if (e.target.type === 'text') {
                        return {
                          ...prevInputValues,
                          [input.inputName]: e.target.value,
                        };
                      } else {
                        return {
                          ...prevInputValues,
                          [input.inputName]: +e.target.value,
                        };
                      }
                    });
                  }}
                  placeholder={`Enter ${input.inputName} here...`}
                />
              );
            })}
          <Button
            color="blue"
            label="Submit"
            onClick={handleSubmit}
            width="full"
            loadingButton
            isLoading={isButtonLoading}
          />
        </form>
      </div>
    </FadeIn>
  );
}
