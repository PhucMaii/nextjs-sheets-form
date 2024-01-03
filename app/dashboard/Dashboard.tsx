'use client';
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar/Navbar';
import Button from '../components/Button/Button';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import FormCard from '../components/FormCard/FormCard';
import LoadingComponent from '../components/LoadingComponent/LoadingComponent';
import { FormType, Notification } from '../utils/type';
import Snackbar from '../components/Snackbar/Snackbar';

interface PropTypes {
  userId: string;
  isLogin: boolean;
}

export default function Dashboard({ userId, isLogin }: PropTypes) {
  const [fadeIn, setFadeIn] = useState(false);
  const [formList, setFormList] = useState<FormType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: '',
    message: '',
  });
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      setFadeIn(true);
    }
  }, [isLoading]);

  useEffect(() => {
    if (userId) {
      fetchForms();
    }
    if (!isLogin) {
      setIsLoading(false);
    }
  }, []);

  const fetchForms = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/allForms/?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-type': 'application/json',
        },
      });
      if (!response.ok) {
        setIsLoading(false);
        setNotification({
          on: true,
          type: 'error',
          message: `Couldn't fetch data. Status ${response.status}`,
        });
        return;
      }
      const res = await response.json();
      res.data.sort(
        (formA: FormType, formB: FormType) =>
          new Date(formB.lastOpened).valueOf() -
          new Date(formA.lastOpened).valueOf(),
      );
      setFormList(res.data);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const handleDeleteForm = async (id: number) => {
    try {
      const response = await fetch(`api/form/?formId=${id}`, {
        method: 'DELETE',
        headers: {
          'Content-type': 'application/json',
        },
      });
      const res = await response.json();
      const newFormList = formList.filter(
        (form) => form.formId !== res.data.formId,
      );
      setFormList(newFormList);
      setNotification({
        on: true,
        type: 'success',
        message: res.message,
      });
    } catch (error) {
      console.log(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 justify-center items-center pt-8 h-screen">
        <LoadingComponent color="blue" width="12" height="12" />
      </div>
    );
  }

  return (
    <div
      className={`transition-opacity duration-700 ease-in ${
        fadeIn ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <Navbar isLogin={isLogin} />
      <Snackbar
        open={notification.on}
        onClose={() => setNotification({ ...notification, on: false })}
        message={notification.message}
        type={notification.type}
      />
      <div className="flex flex-col items-center gap-4 sm:m-2 m-8 p-8 ">
        <h1 className="text-6xl text-center text-blue-500 font-bold">
          Empower Your Business With Precision and Ease
        </h1>
        <div className="w-lg mt-4 sm:w-full lg:w-1/3">
          <Button
            label={isLogin ? 'Create Forms' : 'Get Started'}
            color="blue"
            onClick={() => router.push('/create-form')}
            width="full"
            className="hover:bg-blue-700"
          />
        </div>
      </div>
      {isLogin ? (
        <>
          <div className="sm:m-2 sm:px-0 md:m-8 m-8 px-8 ">
            <h1 className="text-4xl text-blue-500 text-center font-bold mb-8">
              YOUR FORMS
            </h1>
            {formList.length > 0 ? (
              <div className="grid grid-cols-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-4 justify-center flex-wrap mx-auto">
                {formList.map((form) => {
                  return (
                    <FormCard
                      key={form.formId}
                      form={form}
                      handleDelete={handleDeleteForm}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-4 justify-center items-center text-gray-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-12 h-12 font-bold text-center"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
                <h1 className="text-xl text-gray-500 font-medium">
                  You currently do not have any forms
                </h1>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <h2 className="text-4xl font-medium text-center">
            Powerful tool integrate with Google Sheets
          </h2>
          <div className="flex justify-around items-center mt-8">
            <Image
              width={300}
              height={300}
              src="/sample.png"
              alt="Sample"
              style={{ borderRadius: '10px' }}
            />
            <Image
              width={100}
              height={100}
              src="/transfer-icon.png"
              alt="Transfer Icon"
            />
            <Image
              width={300}
              height={300}
              src="/google-sheets.jpg"
              alt="GoogleSheets Img"
              style={{ borderRadius: '10px' }}
            />
          </div>
        </>
      )}
    </div>
  );
}
