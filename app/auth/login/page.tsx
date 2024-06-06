'use client';
import FadeIn from '@/app/HOC/FadeIn';
import LoginAndRegisterGuard from '@/app/HOC/LoginAndRegisterGuard';
import NotificationPopup from '@/app/admin/components/Notification';
import { API_URL } from '@/app/utils/enum';
import { Notification } from '@/app/utils/type';
import { LoadingButton } from '@mui/lab';
import { Box, Paper, TextField, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
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
            router.push('/admin/orders');
          }
        }, 1000);
      } catch (error: any) {
        console.log('Fail to sign in: ', error);
        setNotification({
          on: true,
          type: 'error',
          message: 'Your client id and/or password are not correct',
        });
        setIsLoading(false);
      }
    },
  });

  return (
    <LoginAndRegisterGuard>
      <FadeIn>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          height="100vh"
          gap={2}
        >
          {/* <div className="flex flex-col justify-center items-center h-screen gap-2"> */}
          <NotificationPopup
            notification={notification}
            onClose={() => setNotification({ ...notification, on: false })}
          />
          {/* <div className="shadow-lg rounded-3xl"> */}
          <Paper elevation={8} sx={{ borderRadius: 3 }}>
            {/* <div className="flex gap-2 m-4 items-center cursor-pointer"> */}
            <Box display="flex" gap={2} m={4} alignItems="center">
              <Image
                width={100}
                height={80}
                src="/supremesproutsIcon.png"
                alt="SupremeSproutsLogo"
              />
              <Typography variant="h6" fontWeight="bold" color="primary">
                Supreme Sprouts Ltd.
              </Typography>
            </Box>
            {/* </div> */}
            <form
              className="px-16 pb-16"
              noValidate
              onSubmit={formik.handleSubmit}
            >
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                gap={0.5}
                mb={2}
              >
                {/* <h4 className="text-3xl font-bold text-left">Hello there</h4>
                <h4 className="text-md text-gray-500 text-left">
                  Log in to place your order
                </h4> */}
                <Typography variant="h4" fontWeight="bold">
                  Hello there
                </Typography>
                <Typography variant="subtitle1" color={grey[700]}>
                  Log in to place your order
                </Typography>
              </Box>
              <Box display="flex" flexDirection="column" gap={4}>
                <TextField
                  name="clientId"
                  label="Client Id"
                  placeholder="Enter your client id"
                  type="text"
                  onChange={formik.handleChange}
                  value={formik.values.clientId}
                  onBlur={formik.handleBlur}
                  error={!!(formik.touched.clientId && formik.errors.clientId)}
                  helperText={formik.touched.clientId && formik.errors.clientId}
                  variant="standard"
                />
                <TextField
                  name="password"
                  label="Password"
                  placeholder="Enter your client id"
                  type="password"
                  onChange={formik.handleChange}
                  value={formik.values.password}
                  error={!!(formik.touched.password && formik.errors.password)}
                  onBlur={formik.handleBlur}
                  helperText={formik.touched.password && formik.errors.password}
                  variant="standard"
                />
                <LoadingButton
                  variant="contained"
                  fullWidth
                  loading={isLoading}
                  type="submit"
                >
                  Sign in
                </LoadingButton>
              </Box>
            </form>
          </Paper>

          {/* </div> */}
        </Box>
        {/* </div> */}
      </FadeIn>
    </LoginAndRegisterGuard>
  );
}
