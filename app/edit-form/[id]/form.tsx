'use client';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar/Navbar';
import Input from '../../components/Input/Input';
import Divider from '@/app/components/Divider/Divider';
import { Notification, SessionClientType } from '@/app/utils/type';
import { useSession } from 'next-auth/react';
import { PositionType } from '../../utils/type';
import Button from '@/app/components/Button/Button';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import EditPositionCard from '@/app/components/EditPositionCard/EditPositionCard';
import Snackbar from '@/app/components/Snackbar/Snackbar';
import { ValueType } from '@/app/components/Select/Select';

export default function EditForm() {
  const [formName, setFormName] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(true);
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: '',
    message: '',
  });
  const [positionList, setPositionList] = useState<PositionType[]>([]);
  const [sheetNames, setSheetNames] = useState<ValueType[]>([]);
  const { id }: { id: string | null } = useParams() as { id: string | null };
  const { data: session, status }: SessionClientType =
    useSession() as SessionClientType;
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      fetchForm();
      fetchSheetsName();
    }
  }, [status]);

  const fetchForm = async () => {
    try {
      const response = await fetch(`/api/form/?id=${id}`, {
        method: 'GET',
        headers: {
          'Content-type': 'application/json',
        },
      });
      if (!response.ok) {
        setNotification({
          on: true,
          type: 'error',
          message: `Error fetching data. Status: ${response.status}`,
        });
        return;
      }
      const comingData = await response.json();
      const data = comingData.data;
      if (parseInt(session?.user?.id as string) !== data.userId) {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }
      setFormName(data.formName);
      setPositionList(data.positions);
      setIsLoading(false);
    } catch (error: unknown) {
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to fetch',
      });
      console.log(error);
    }
  };

  const fetchSheetsName = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/sheets', {
        method: 'GET',
        headers: {
          'Content-type': 'application/json',
        },
      });
      let data = await response.json();
      data = data.map((sheet: ValueType) => {
        return {
          value: sheet,
          label: sheet,
        };
      });
      setSheetNames(data);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const updateFormName = async () => {
    try {
      const body = {
        formId: id,
        formName,
      };
      const response = await fetch('/api/form', {
        method: 'PUT',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const res = await response.json();
      setNotification({
        on: true,
        type: 'success',
        message: res.message,
      });
    } catch (error) {
      console.log('There was an error updating form name, ', error);
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to update form name: ' + error,
      });
    }
  };

  if (isLoading || status === 'loading') {
    return (
      <div className="flex flex-col gap-8 items-center mt-8">
        <LoadingComponent color="blue" />
        <h2 className="font-bold text-lg">Loading...</h2>
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
    <div>
      <Navbar isLogin={true} />
      <Snackbar
        open={notification.on}
        onClose={() => setNotification({ ...notification, on: false })}
        type={notification.type}
        message={notification.message}
      />
      <h2 className="mb-4 text-4xl text-center text-blue-600 font-bold">
        Edit Form
      </h2>
      <div className="sm:mx-4 lg:mx-80 my-4">
        <Input
          label="Form Name"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setFormName(e.target.value)
          }
          type="text"
          placeholder="Enter form name"
          value={formName}
          className="w-full"
        />
        <Button
          label="Save"
          color="blue"
          onClick={updateFormName}
          width="full"
        />
      </div>
      <Divider label="Positions" />
      <div className="flex w-full m-4 mt-8 gap-8 overflow-x-scroll">
        {positionList.length > 0 &&
          positionList.map((position) => {
            return (
              <EditPositionCard
                key={Number(position.positionId)}
                position={position}
                sheetNames={sheetNames}
                setNotification={setNotification}
                fetchForm={fetchForm}
              />
            );
          })}
      </div>
    </div>
  );
}
