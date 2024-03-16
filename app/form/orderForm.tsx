'use client';
import React, { MouseEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FormType, Notification, SessionClientType } from '@/app/utils/type';
import Button from '@/app/components/Button';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import Navbar from '@/app/components/Navbar';
import Snackbar from '@/app/components/Snackbar/Snackbar';
import { InputType } from '../utils/type';
import Input from '@/app/components/Input';
import FadeIn from '@/app/HOC/FadeIn';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Box } from '@mui/material';
import { YYYYMMDDFormat } from '@/app/utils/time';
import { grey } from '@mui/material/colors';
import ChangePasswordModal from '../components/Modals/ChangePasswordModal';

export default function OrderForm() {
  const [formData, setFormData] = useState<FormType>({
    userId: 0,
    formId: 0,
    formName: '',
    lastOpened: new Date(),
  });
  const [inputList, setInputList] = useState<InputType[]>([]);
  const [inputValues, setInputValues] = useState<any>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);
  const [isOpenSecurityModal, setIsOpenSecurityModal] =
    useState<boolean>(false);
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: 'info',
    message: '',
  });
  const { status }: SessionClientType = useSession() as SessionClientType;
  const router = useRouter();

  useEffect(() => {
    fetchForm();
  }, []);

  const fetchForm = async () => {
    try {
      const response = await axios.get(`${API_URL.FORM}?id=${1}`);
      const data = response.data.data;

      createInputValues(data.inputs);
      setInputList(data.inputs);
      setFormData(data);
      setIsLoading(false);
    } catch (error: any) {
      if (error.response.status === 404) {
        router.push('/404');
      }
      setNotification({
        on: true,
        type: 'error',
        message: error.response.data.error,
      });
      console.log(error);
    }
  };

  const createInputValues = (inputs: InputType[]) => {
    const newInputValues: any = {};
    for (const input of inputs) {
      if (input.inputType === 'text') {
        newInputValues[input.inputName] = '';
      } else if (input.inputType === 'date') {
        // format initial date
        const dateObj = new Date();
        const formattedDate = YYYYMMDDFormat(dateObj);

        newInputValues[input.inputName] = formattedDate;
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
      const response = await axios.post(API_URL.IMPORT_SHEETS, inputValues);
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

  const handleDateChange = (e: any, input: any) => {
    const dateObj = new Date(e.$d);

    const formattedDate = YYYYMMDDFormat(dateObj);

    setInputValues((prevInputValues: any) => {
      return {
        ...prevInputValues,
        [input.inputName]: formattedDate,
      };
    });
  };

  if (isLoading || status === 'loading') {
    return (
      <div className="flex flex-col gap-8 justify-center items-center pt-8 h-screen">
        <LoadingComponent color="blue" />
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
      <ChangePasswordModal
        isOpen={isOpenSecurityModal}
        onClose={() => setIsOpenSecurityModal(false)}
      />
      <Navbar handleOpenSecurityModal={() => setIsOpenSecurityModal(true)} />
      <div className="max-w-2xl mx-auto py-16">
        <h4 className="text-center font-bold text-4xl px-8">
          {formData.formName}
        </h4>
        <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          {inputList.length > 0 &&
            inputList.map((input, index) => {
              if (input.inputType === 'date') {
                return (
                  <Box key={index} mb={4}>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      {input.inputName}
                    </label>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        value={dayjs(inputValues[input.inputName])}
                        onChange={(e: any) => handleDateChange(e, input)}
                        sx={{
                          width: '100%',
                          height: '0.1%',
                          border: `1px solid ${grey[600]}`,
                          borderRadius: 2,
                        }}
                      />
                    </LocalizationProvider>
                  </Box>
                );
              }

              if (input.inputName === 'NOTE') {
                return (
                  <Input<string>
                    key={index}
                    label={input.inputName}
                    multiline
                    value={inputValues[input.inputName]}
                    className="border-neutral-400 h-full mb-4"
                    onChange={(e: any) => {
                      setInputValues((prevInputValues: any) => {
                        return {
                          ...prevInputValues,
                          [input.inputName]: e.target.value,
                        };
                      });
                    }}
                    placeholder={`Enter ${input.inputName} here...`}
                  />
                );
              }
              return (
                <Input<string | number>
                  key={index}
                  label={input.inputName}
                  type={input.inputType}
                  value={inputValues[input.inputName]}
                  className="border-neutral-400 h-full mb-4"
                  onChange={(e: any) => {
                    setInputValues((prevInputValues: any) => {
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
