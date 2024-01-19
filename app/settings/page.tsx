'use client';
import React, { useEffect, useState } from 'react';
import FadeIn from '../HOC/FadeIn';
import Divider from '../components/Divider/Divider';
import Input from '../components/Input/Input';
import Button from '../components/Button/Button';
import Navbar from '../components/Navbar/Navbar';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { Notification, UserType } from '../utils/type';
import Snackbar from '../components/Snackbar/Snackbar';

export default function page() {
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [updateGeneralInfoLoading, setUpdateGeneralInfoLoading] =
    useState<boolean>(false);
  const [updatePasswordLoading, setUpdatePasswordLoading] =
    useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>('');
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: '',
    message: '',
  });
  const [userData, setUserData] = useState<UserType>();
  const { data: session }: any = useSession();

  useEffect(() => {
    if (session) {
      fetchUserData();
    }
  }, [session]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`/api/user?id=${session?.user.id}`);
      const { id, email, firstName }: UserType = response.data.data;
      setUserData({ id, email, firstName });
    } catch (error) {
      console.log(error);
    }
  };

  const editUserData = (field: string, value: any) => {
    setUserData((prevUserData: any) => ({
      ...prevUserData,
      [field]: value,
    }));
  };

  const updatePassword = async () => {
    if (!currentPassword || !newPassword) {
      setNotification({
        on: true,
        type: 'error',
        message: 'Missing either current password or new password',
      });
      return;
    }

    setUpdatePasswordLoading(true);
    try {
      const response = await axios.put('/api/user', {
        userId: userData?.id,
        currentPassword,
        newPassword,
      });

      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
      setUpdatePasswordLoading(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
      setNotification({
        on: true,
        type: 'error',
        message: error.response.data.error,
      });
      console.log('Internal Server Error', error);
      setUpdatePasswordLoading(false);
    }
  };

  const updateUserData = async () => {
    setUpdateGeneralInfoLoading(true);
    try {
      const response = await axios.put('/api/user', {
        userId: userData?.id,
        email: userData?.email,
        firstName: userData?.firstName,
      });

      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
      setUpdateGeneralInfoLoading(false);
    } catch (error: any) {
      setNotification({
        on: true,
        type: 'error',
        message: error.response.data.error,
      });
      console.log('Internal Server Error', error);
      setUpdateGeneralInfoLoading(false);
    }
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
      <div className="max-w-2xl mx-auto py-16">
        <h4 className="text-2xl font-bold">Settings</h4>
        <Divider />
        <div className="grid grid-cols-2 mb-6">
          <h4 className="text-xl mt-4">General Information</h4>
          <div className="flex flex-col gap-4 mt-4">
            <Input
              label="Name"
              placeholder="Enter your name"
              type="text"
              value={userData?.firstName}
              onChange={(e) => editUserData('firstName', e.target.value)}
              className="mb-0"
            />
            <Divider />
            <Input
              label="Email"
              placeholder="Enter your email"
              type="text"
              value={userData?.email}
              onChange={(e) => editUserData('email', e.target.value)}
              className="mb-0"
            />
            <Button
              color="blue"
              label="Update"
              onClick={updateUserData}
              width="100%"
              loadingButton
              isLoading={updateGeneralInfoLoading}
            />
          </div>
        </div>
        <Divider />
        <div className="grid grid-cols-2">
          <h4 className="text-xl mt-4">Security</h4>
          <div className="flex flex-col gap-4 mt-4">
            <Input
              label="Current Password"
              placeholder="Enter your current password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mb-0"
            />
            <Divider />
            <Input
              label="New Password"
              placeholder="Enter your new password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mb-0"
            />
            <Button
              color="blue"
              label="Update"
              onClick={updatePassword}
              width="100%"
              loadingButton
              isLoading={updatePasswordLoading}
            />
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
