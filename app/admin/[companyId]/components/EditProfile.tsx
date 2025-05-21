import React, { useEffect, useState } from 'react';
import { ShadowSection } from '../reports/styled';
import {
  Box,
  IconButton,
  InputAdornment,
  OutlinedInput,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { blueGrey } from '@mui/material/colors';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import useNotification from '@/hooks/useNotification';
import { useParams } from 'next/navigation';
import { fetchApi } from '@/app/utils/db';

export default function EditProfile() {
  const { companyId }: any = useParams();
  const [employee, setEmployee] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [passwordGroup, setPasswordGroup] = useState<any>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showOldPassword, setShowOldPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const { showNotification, NotificationComp } = useNotification();

  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

  // Context
  // const { user } = useContext(UserContext);

  // useEffect(() => {
  //   if (user) {
  //     setEmail(user.email);
  //     setName(user.clientName);
  //   }
  // }, [user]);

  useEffect(() => {
    fetchEmployee();
  }, []);

  const fetchEmployee = async () => {
    const data = await fetchApi(
      getAdminApiUrl(companyId, '/profile'),
      showNotification,
    );
    setEmployee(data);
  };

  const checkPasswordInput = () => {
    if (
      !passwordGroup.oldPassword ||
      !passwordGroup.newPassword ||
      !passwordGroup.confirmPassword
    ) {
      return {
        isValid: false,
        message: 'All password fields need to be filled out',
      };
    }

    if (passwordGroup.confirmPassword !== passwordGroup.newPassword) {
      return { isValid: false, message: 'Confirm password does not match' };
    }

    return { isValid: true, message: '' };
  };

  const handleChangePasswordGroup = (key: string, value: string) => {
    setPasswordGroup({ ...passwordGroup, [key]: value });
  };

  const handleUpdateGeneral = async () => {
    try {
      setIsSubmitting(true);
      const response = await axios.put(getAdminApiUrl(companyId, '/profile'), {
        email: employee?.email,
        name: employee?.name,
        id: employee?.id,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsSubmitting(false);
        return;
      }

      showNotification('success', response.data.message);
      setIsSubmitting(false);
    } catch (error: any) {
      console.log('Fail to update client email: ', error);
      showNotification('error', 'Fail to update client email: ' + error);
      setIsSubmitting(false);
    }
  };

  const handleUpdatePassword = async () => {
    const { isValid, message } = checkPasswordInput();
    if (!isValid) {
      showNotification('error', message);
      return;
    }

    try {
      setIsSubmitting(true);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...submittedData } = passwordGroup;
      const response = await axios.put(getAdminApiUrl(companyId, '/profile'), {
        ...submittedData,
        id: employee?.id,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsSubmitting(false);
        return;
      }

      showNotification('success', response.data.message);
      setIsSubmitting(false);
    } catch (error: any) {
      console.log('Fail to update user password: ', error);
      showNotification('error', error.response.data.error);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {NotificationComp}
      {/* Geenral Information */}
      <ShadowSection display="flex" flexDirection="column" gap={2}>
        <Typography variant="h6" color={blueGrey[800]} sx={{ mb: 2 }}>
          General Information
        </Typography>
        <Box display="flex" flexDirection="column" gap={1}>
          <Typography variant="subtitle1" color={blueGrey[800]}>
            Name
          </Typography>
          <TextField
            variant="outlined"
            // label="Name"
            placeholder="Please enter your name..."
            value={employee?.name}
            onChange={(e: any) =>
              setEmployee({ ...employee, name: e.target.value })
            }
          />
        </Box>
        <Box display="flex" flexDirection="column" gap={1}>
          <Typography variant="subtitle1" color={blueGrey[800]}>
            Email
          </Typography>
          <TextField
            variant="outlined"
            // label="Name"
            placeholder="Please enter your email..."
            value={employee?.email}
            onChange={(e: any) =>
              setEmployee({ ...employee, email: e.target.value })
            }
          />
        </Box>
        <Box display="flex" justifyContent="right" mt={2}>
          <LoadingButton
            variant="contained"
            onClick={handleUpdateGeneral}
            loading={isSubmitting}
            fullWidth={smDown}
          >
            Save
          </LoadingButton>
        </Box>
      </ShadowSection>

      {/* Security Section */}
      <ShadowSection display="flex" flexDirection="column" gap={2}>
        <Typography variant="h6" color={blueGrey[800]} sx={{ mb: 2 }}>
          Security
        </Typography>
        <Box display="flex" flexDirection="column" gap={1}>
          <Typography variant="subtitle1" color={blueGrey[800]}>
            Current password
          </Typography>
          <OutlinedInput
            fullWidth
            id="old-password"
            type={showOldPassword ? 'text' : 'password'}
            onChange={(e) => {
              handleChangePasswordGroup('oldPassword', e.target.value);
            }}
            value={passwordGroup.oldPassword}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowOldPassword((show) => !show)}
                  edge="end"
                >
                  {showOldPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
          />
        </Box>
        <Box display="flex" flexDirection="column" gap={1}>
          <Typography variant="subtitle1" color={blueGrey[800]}>
            New password
          </Typography>
          <OutlinedInput
            fullWidth
            id="new-password"
            type={showNewPassword ? 'text' : 'password'}
            onChange={(e) => {
              handleChangePasswordGroup('newPassword', e.target.value);
            }}
            value={passwordGroup.newPassword}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowNewPassword((show) => !show)}
                  edge="end"
                >
                  {showNewPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
          />
        </Box>
        <Box display="flex" flexDirection="column" gap={1}>
          <Typography variant="subtitle1" color={blueGrey[800]}>
            Confirm new password
          </Typography>
          <OutlinedInput
            fullWidth
            id="confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            onChange={(e) => {
              handleChangePasswordGroup('confirmPassword', e.target.value);
            }}
            value={passwordGroup.confirmPassword}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowConfirmPassword((show) => !show)}
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
          />
        </Box>
        <Box display="flex" justifyContent="right">
          <LoadingButton
            variant="contained"
            loading={isSubmitting}
            fullWidth={smDown}
            onClick={handleUpdatePassword}
          >
            Update
          </LoadingButton>
        </Box>
      </ShadowSection>
    </>
  );
}
