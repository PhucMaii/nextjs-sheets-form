import React, { useState } from 'react';
import Modal from 'react-modal';
import { modalStyles } from './styles';
import Input from '../Input';
import Button from '../Button';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import { Notification } from '@/app/utils/type';

interface PropTypes {
  isOpen: boolean;
  onClose: () => void;
}

interface FormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePasswordModal({ isOpen }: PropTypes) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: '',
    message: '',
  });

  const fomrik = useFormik<FormValues>({
    initialValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      oldPassword: Yup.string().required('Old password is required'),
      newPassword: Yup.string().required('New password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), 'Passwords Do Not Match'])
        .required('Confirm Password is required'),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { confirmPassword, ...submittedData } = values;
        const response = await axios.put(API_URL.USER, submittedData);

        if (response.data.error) {
          setNotification({
            on: true,
            type: 'error',
            message: response.data.error,
          });
          setIsLoading(false);
          return;
        }

        setNotification({
          on: true,
          type: 'success',
          message: response.data.error,
        });
        setIsLoading(false);
      } catch (error) {
        console.log('Fail to update user password: ', error);
        setIsLoading(false);
      }
    },
  });
  return (
    <Modal isOpen={isOpen} style={modalStyles}>
      <div className="flex flex-col items-center w-full p-4 gap-2 ">
        <h1 className="font-bold text-center text-lg mb-4">Change Password</h1>
        <Input<string>
          label="Old Password"
          onChange={() => {}}
          placeholder="Enter your old password"
          value={''}
          type="password"
          className="text-left"
        />
        <Input<string>
          label="New Password"
          onChange={() => {}}
          placeholder="Enter your new password"
          value={''}
          type="password"
          className="text-left"
        />
        <Input<string>
          label="Confirm Password"
          onChange={() => {}}
          placeholder="Enter your confirm password"
          value={''}
          type="password"
          className="text-left"
        />
        <Button label="Update" color="blue" width="full" />
      </div>
    </Modal>
  );
}
