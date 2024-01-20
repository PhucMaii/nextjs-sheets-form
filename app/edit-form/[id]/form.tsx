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
import AddPosition from '@/app/components/Modals/AddPosition';
import FadeIn from '@/app/HOC/FadeIn';
import { API_URL } from '@/app/utils/enum';
import axios from 'axios';

interface OwnPositionType extends PositionType {
  positionId: number;
}

export default function EditForm() {
  const [formName, setFormName] = useState<string>('');
  const [saveFormNameLoading, setSaveFormNameLoading] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAddPositionOpen, setIsAddPositionOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: '',
    message: '',
  });
  const [positionList, setPositionList] = useState<OwnPositionType[]>([]);
  const [sheetNames, setSheetNames] = useState<ValueType[]>([]);
  const { id }: { id: string | null } = useParams() as { id: string | null };
  const { status }: SessionClientType = useSession() as SessionClientType;
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      const fetching = async () => {
        const name = await fetchForm();
        setFormName(name);
      };
      fetching();
      fetchSheetsName();
    }
  }, [status]);

  const handleChangePositionList = (
    positionId: number,
    field: string,
    value: any,
  ) => {
    setPositionList((prevList) => {
      return prevList.map((pos) => {
        if (pos.positionId === positionId) {
          return {
            ...pos,
            [field]: value,
          };
        }
        return pos;
      });
    });
  };

  const fetchForm = async () => {
    try {
      const response = await axios.get(`${API_URL.FORM}?id=${id}`);
      const data = response.data.data;

      setPositionList(data.positions);
      setIsLoading(false);
      return data.formName;
    } catch (error: any) {
      if (error.response.status === 404) {
        router.push('/404');
      }
      setNotification({
        on: true,
        type: 'error',
        message: error.response.data.message,
      });
      console.log(error);
    }
  };

  const fetchSheetsName = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL.SHEETS);

      const data = response.data.data.map((sheet: ValueType) => {
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

  const handleAddPosition = async (sheetName: string, row: number) => {
    if (!sheetName) {
      setNotification({
        on: true,
        type: 'error',
        message: 'Sheet Name is required',
      });
      setIsLoading(false);
      return;
    }

    const data = { formId: Number(id), sheetName, row };

    try {
      const response = await axios.post(API_URL.POSITION, data);

      setPositionList([
        ...positionList,
        { ...data, positionId: response.data.data.positionId, inputs: [] },
      ]);

      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });

      setIsAddPositionOpen(false);
    } catch (error: any) {
      console.log(error);
      setIsLoading(false);
      setNotification({
        on: true,
        type: 'error',
        message: error.response.data.error,
      });
    }
  };

  const handleDeletePosition = async (positionId: number) => {
    try {
      const response = await axios.delete(
        `${API_URL.POSITION}?positionId=${positionId}`,
      );

      const updatedPositions = positionList.filter((pos) => {
        return pos.positionId !== positionId;
      });

      setPositionList(updatedPositions);
      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
    } catch (error: any) {
      console.log(error);
      setNotification({
        on: true,
        type: 'error',
        message: error.response.data.error,
      });
    }
  };

  const updateFormName = async () => {
    setSaveFormNameLoading(true);
    try {
      const submittedData = {
        formId: id,
        formName,
      };
      const response = await axios.put(API_URL.FORM, submittedData);

      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
      setSaveFormNameLoading(false);
    } catch (error: any) {
      console.log('There was an error updating form name, ', error);
      setNotification({
        on: true,
        type: 'error',
        message: error.response.data.error,
      });
      setSaveFormNameLoading(false);
    }
  };

  if (isLoading || status === 'loading') {
    return (
      <div className="flex flex-col gap-8 justify-center items-center pt-8 h-screen">
        <LoadingComponent color="blue" width="12" height="12" />
      </div>
    );
  }

  return (
    <FadeIn>
      <Navbar isLogin={true} />
      <Snackbar
        open={notification.on}
        onClose={() => setNotification({ ...notification, on: false })}
        type={notification.type}
        message={notification.message}
      />
      <AddPosition
        fetchForm={fetchForm}
        isOpen={isAddPositionOpen}
        onClose={() => setIsAddPositionOpen(false)}
        setNotification={setNotification}
        handleAddPosition={handleAddPosition}
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
          loadingButton
          isLoading={saveFormNameLoading}
        />
      </div>
      <Divider label="Positions" />
      <div className="flex w-full m-4 mt-8 gap-8 overflow-x-scroll">
        {positionList.length > 0 &&
          positionList.map((position) => {
            return (
              <EditPositionCard
                key={Number(position.positionId)}
                handleChangePositionList={handleChangePositionList}
                handleDeletePos={handleDeletePosition}
                position={position}
                sheetNames={sheetNames}
                setNotification={setNotification}
                fetchForm={fetchForm}
              />
            );
          })}
        <Button
          label="+ Add Position"
          color="sky"
          onClick={() => setIsAddPositionOpen(true)}
          width="auto"
          className="bg-sky-600 hover:bg-sky-800 h-1/5"
        />
      </div>
    </FadeIn>
  );
}
