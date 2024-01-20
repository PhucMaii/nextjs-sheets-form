'use client';
import FadeIn from '@/app/HOC/FadeIn';
import Button from '@/app/components/Button/Button';
import Input from '@/app/components/Input/Input';
import Snackbar from '@/app/components/Snackbar/Snackbar';
import { Notification } from '@/app/utils/type';
import { useFormik } from 'formik';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import * as Yup from 'yup';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';

interface FormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function page() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: '',
    message: '',
  });
  const router = useRouter();

  const formik = useFormik<FormValues>({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Please enter your name'),
      email: Yup.string()
        .email('Must be a valid email!')
        .max(255)
        .required('Email is required'),
      password: Yup.string()
        .min(6, 'Password need to be at least 6 characters')
        .max(255)
        .required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), 'Passwords Do Not Match'])
        .required('Password confirm is required'),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      const submittedData = {
        firstName: values.name,
        email: values.email,
        password: values.password,
      };
      try {
        const response = await axios.post(API_URL.SIGNUP, submittedData);

        setNotification({
          on: true,
          type: 'success',
          message: response.data.message,
        });
        setIsLoading(false);
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      } catch (error: any) {
        console.log(error);
        setNotification({
          on: true,
          type: 'error',
          message: error.response.data.error,
        });
        setIsLoading(false);
      }
    },
  });

  return (
    <FadeIn>
      <div className="flex flex-col justify-center items-center h-screen gap-2">
        <Snackbar
          open={notification.on}
          onClose={() => setNotification({ ...notification, on: false })}
          type={notification.type}
          message={notification.message}
        />
        <div className="shadow-lg rounded-3xl">
          <div className="flex gap-2 m-4 items-center cursor-pointer">
            <Image
              width={20}
              height={20}
              src="/computer-icon.png"
              alt="computer"
            />
            <h2 className="text-blue-500 font-bold text-lg">DataHabor Pro</h2>
          </div>
          <form className="p-16" noValidate onSubmit={formik.handleSubmit}>
            <h4 className="text-3xl font-bold text-left mb-8">
              Register New Account
            </h4>
            <div className="flex flex-col gap-2">
              <Input
                label="Name"
                placeholder="eg: John"
                onChange={formik.handleChange}
                type="text"
                value={formik.values.name}
                className={`m-0 p-0 w-80 ${
                  !(formik.touched.name && formik.errors.name)
                    ? ''
                    : 'border-red-500'
                }`}
                onBlur={formik.handleBlur}
                name="name"
                error={!!(formik.touched.name && formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
              <Input
                label="Email"
                placeholder="eg: john@gmail.com"
                onChange={formik.handleChange}
                type="email"
                value={formik.values.email}
                className={`m-0 p-0 w-80 ${
                  !(formik.touched.email && formik.errors.email)
                    ? ''
                    : 'border-red-500'
                }`}
                onBlur={formik.handleBlur}
                name="email"
                error={!!(formik.touched.email && formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
              <Input
                label="Password"
                placeholder="eg: strongpassword"
                onChange={formik.handleChange}
                type="password"
                value={formik.values.password}
                className={`m-0 p-0 w-80 ${
                  !(formik.touched.password && formik.errors.password)
                    ? ''
                    : 'border-red-500'
                }`}
                name="password"
                error={!!(formik.touched.password && formik.errors.password)}
                onBlur={formik.handleBlur}
                helperText={formik.touched.password && formik.errors.password}
              />
              <Input
                label="Confirm Password"
                placeholder="eg: strongpassword"
                onChange={formik.handleChange}
                type="password"
                value={formik.values.confirmPassword}
                className={`m-0 p-0 w-80 ${
                  !(
                    formik.touched.confirmPassword &&
                    formik.errors.confirmPassword
                  )
                    ? ''
                    : 'border-red-500'
                }`}
                name="confirmPassword"
                error={
                  !!(
                    formik.touched.confirmPassword &&
                    formik.errors.confirmPassword
                  )
                }
                onBlur={formik.handleBlur}
                helperText={
                  formik.touched.confirmPassword &&
                  formik.errors.confirmPassword
                }
              />
              <Button
                color="blue"
                label="Register"
                width="full"
                loadingButton
                isLoading={isLoading}
                type="submit"
              />
            </div>
          </form>
        </div>
      </div>
    </FadeIn>
  );
}
