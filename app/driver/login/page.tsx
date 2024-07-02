'use client';
import FadeIn from '@/app/HOC/FadeIn';
import LoginAndRegisterGuard from '@/app/HOC/LoginAndRegisterGuard';
import NotificationPopup from '@/app/admin/components/Notification';
import { Notification } from '@/app/utils/type';
import { LoadingButton } from '@mui/lab';
import { Box, Paper, TextField, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { useFormik } from 'formik';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import * as Yup from 'yup';

interface FormValues {
  driverName: string;
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
      driverName: '',
      password: '',
      submit: null,
    },
    validationSchema: Yup.object({
      driverName: Yup.string().max(255).required('Name is required'),
      password: Yup.string().max(255).required('Password is required'),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);

      try {
        const driver = await signIn('credentials', {
          redirect: false,
          driverName: values.driverName.toUpperCase(),
          password: values.password,
        });

        if (driver && driver.error) {
          setNotification({
            on: true,
            type: 'error',
            message: driver.error,
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
          router.push('/driver/overview');
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
          <NotificationPopup
            notification={notification}
            onClose={() => setNotification({ ...notification, on: false })}
          />
          <Paper elevation={8} sx={{ borderRadius: 3 }}>
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
                <Typography variant="h4" fontWeight="bold">
                  Welcome back
                </Typography>
                <Typography variant="subtitle1" color={grey[700]}>
                  Log in to view your schedule today
                </Typography>
              </Box>
              <Box display="flex" flexDirection="column" gap={4}>
                <TextField
                  name="driverName"
                  label="Driver Name"
                  placeholder="Enter your name"
                  type="text"
                  onChange={formik.handleChange}
                  value={formik.values.driverName}
                  onBlur={formik.handleBlur}
                  error={!!(formik.touched.driverName && formik.errors.driverName)}
                  helperText={formik.touched.driverName && formik.errors.driverName}
                  variant="standard"
                />
                <TextField
                  name="password"
                  label="Password"
                  placeholder="Enter your password"
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
        </Box>
      </FadeIn>
    </LoginAndRegisterGuard>
  );
}
