import React, { useState } from 'react';
import Modal from 'react-modal';
import { modalStyles } from './styles';
import Input from '../Input';
import Button from '../Button';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import Alert from '../Alert';
import FadeIn from '@/HOC/FadeIn';
import useNotification from '@/hooks/useNotification';

interface PropTypes {
  isOpen: boolean;
  onClose: () => void;
}

interface FormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePasswordModal({ isOpen, onClose }: PropTypes) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { notification, showNotification, closeNotification } = useNotification();

  const formik = useFormik<FormValues>({
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
          showNotification('error', response.data.error);
          setIsLoading(false);
          return;
        }

        showNotification('success', response.data.message);
        setIsLoading(false);
      } catch (error: any) {
        console.log('Fail to update user password: ', error);
        showNotification('error', error.response.data.error);
        setIsLoading(false);
      }
    },
  });
  return (
    <FadeIn>
      <Modal isOpen={isOpen} style={modalStyles} onRequestClose={onClose}>
        <form
          className="flex flex-col items-center w-full p-4 gap-2"
          noValidate
          onSubmit={formik.handleSubmit}
        >
          <h1 className="font-bold text-center text-lg mb-4">
            Change Password
          </h1>
          {notification.on && (
            <Alert
              notification={notification}
              onClose={closeNotification}
            />
          )}
          <Input<string>
            className={`text-left m-0 p-0 w-80 ${
              !(formik.touched.oldPassword && formik.errors.oldPassword)
                ? ''
                : 'border-red-500'
            }`}
            error={!!(formik.touched.oldPassword && formik.errors.oldPassword)}
            helperText={formik.touched.oldPassword && formik.errors.oldPassword}
            label="Old Password"
            name="oldPassword"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            placeholder="Enter your old password"
            type="password"
            value={formik.values.oldPassword}
          />
          <Input<string>
            className={`text-left m-0 p-0 w-80 ${
              !(formik.touched.oldPassword && formik.errors.oldPassword)
                ? ''
                : 'border-red-500'
            }`}
            error={!!(formik.touched.newPassword && formik.errors.newPassword)}
            helperText={formik.touched.newPassword && formik.errors.newPassword}
            label="New Password"
            name="newPassword"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            placeholder="Enter your new password"
            type="password"
            value={formik.values.newPassword}
          />
          <Input<string>
            className={`text-left m-0 p-0 w-80 ${
              !(formik.touched.oldPassword && formik.errors.oldPassword)
                ? ''
                : 'border-red-500'
            }`}
            error={
              !!(
                formik.touched.confirmPassword && formik.errors.confirmPassword
              )
            }
            helperText={
              formik.touched.confirmPassword && formik.errors.confirmPassword
            }
            label="Confirm Password"
            name="confirmPassword"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            placeholder="Enter your confirm password"
            type="password"
            value={formik.values.confirmPassword}
          />
          <Button
            color="blue"
            loadingButton
            isLoading={isLoading}
            label="Update"
            type="submit"
            width="full"
          />
        </form>
      </Modal>
    </FadeIn>
  );
}
