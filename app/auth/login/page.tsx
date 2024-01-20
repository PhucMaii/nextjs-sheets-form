'use client';
import FadeIn from '@/app/HOC/FadeIn';
import Button from '@/app/components/Button/Button';
import Input from '@/app/components/Input/Input';
import Snackbar from '@/app/components/Snackbar/Snackbar';
import { Notification } from '@/app/utils/type';
import { useFormik } from 'formik';
import { signIn, useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import * as Yup from 'yup';

interface FormValues {
  email: string;
  password: string;
  submit: any;
}

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: '',
    message: '',
  });
  const { data: session } = useSession();
  const router = useRouter();

  const formik = useFormik<FormValues>({
    initialValues: {
      email: '',
      password: '',
      submit: null,
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Must be a valid email!')
        .max(255)
        .required('Email is required'),
      password: Yup.string().max(255).required('Password is required'),
    }),
    onSubmit: async (values) => {
      setIsLogin(true);
      setIsLoading(true);

      const user = await signIn('credentials', {
        redirect: false,
        email: values.email,
        password: values.password,
      });

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
        window.location.reload(); // with auth guard => redirect user to homepage
      }, 1000);
    },
  });

  if (!isLogin && session) {
    router.push('/');
  }

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
            <h4 className="text-3xl font-bold text-left">Welcome Back</h4>
            <h4 className="text-md text-gray-500 mb-8 text-left">
              Login to access more enhanced features
            </h4>
            <div className="flex flex-col gap-2">
              <Input
                label="Email"
                placeholder="eg: John"
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
                placeholder="eg: john@gmail.com"
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
  );
}
