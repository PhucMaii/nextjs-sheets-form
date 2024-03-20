'use client';
import FadeIn from '@/app/HOC/FadeIn';
import LoginAndRegisterGuard from '@/app/HOC/LoginAndRegisterGuard';
import Button from '@/app/components/Button';
import Input from '@/app/components/Input';
import Snackbar from '@/app/components/Snackbar/Snackbar';
import { API_URL } from '@/app/utils/enum';
import { Notification } from '@/app/utils/type';
import axios from 'axios';
import { useFormik } from 'formik';
import { getSession, signIn } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import * as Yup from 'yup';

interface FormValues {
  clientId: string;
  password: string;
  submit: any;
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: 'info',
    message: '',
  });
  const router = useRouter();

  const formik = useFormik<FormValues>({
    initialValues: {
      clientId: '',
      password: '',
      submit: null,
    },
    validationSchema: Yup.object({
      clientId: Yup.string().max(255).required('Client ID is required'),
      password: Yup.string().max(255).required('Password is required'),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);

      try {
        const user = await signIn('credentials', {
          redirect: false,
          clientId: values.clientId,
          password: values.password,
        });
  
        const session: any = await getSession();
        const response = await axios.get(
          `${API_URL.USER}?id=${session?.user.id}`,
        );
        const userData = response.data.data;
  
        if (user && user.error) {
          setNotification({
            on: true,
            type: 'error',
            message: user.error,
          });
          setIsLoading(false);
          return;
        }
  
        setNotification({
          on: true,
          type: 'success',
          message: 'Login Successful',
        });
        setIsLoading(false);
        setTimeout(() => {
          if (userData.role === 'client') {
            router.push('/');
          } else {
            router.push('/admin/overview');
          }
        }, 1000);
      } catch (error: any) {
        console.log('Fail to sign in: ', error);
        setNotification({
          on: true,
          type: 'error',
          message: 'Your client id and/or password are not correct'
        });
        setIsLoading(false);
      }
    },
  });

  return (
    <LoginAndRegisterGuard>
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
              <h4 className="text-3xl font-bold text-left">Hello there</h4>
              <h4 className="text-md text-gray-500 mb-8 text-left">
                Log in to place your order
              </h4>
              <div className="flex flex-col gap-2">
                <Input
                  label="Client Id"
                  placeholder="Enter your client id"
                  onChange={formik.handleChange}
                  type="text"
                  value={formik.values.clientId}
                  className={`m-0 p-0 w-80 ${
                    !(formik.touched.clientId && formik.errors.clientId)
                      ? ''
                      : 'border-red-500'
                  }`}
                  onBlur={formik.handleBlur}
                  name="clientId"
                  error={!!(formik.touched.clientId && formik.errors.clientId)}
                  helperText={formik.touched.clientId && formik.errors.clientId}
                />
                <Input
                  label="Password"
                  placeholder="Enter your password"
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
                <Button
                  color="blue"
                  label="Sign in"
                  width="full"
                  loadingButton
                  isLoading={isLoading}
                  type="submit"
                  className="bg-blue-600"
                />
              </div>
            </form>
          </div>
        </div>
      </FadeIn>
    </LoginAndRegisterGuard>
  );
}
