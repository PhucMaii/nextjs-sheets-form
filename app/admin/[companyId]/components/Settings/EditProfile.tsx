import React, { useEffect, useState } from 'react';
import {
  Box,
  FormControlLabel,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
  Chip,
} from '@mui/material';
import { blueGrey, orange, green } from '@mui/material/colors';
import {
  Visibility,
  VisibilityOff,
  PowerSettingsNew,
  Warning,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import useNotification from '@/hooks/useNotification';
import { useParams } from 'next/navigation';
import { fetchApi } from '@/app/utils/db';
import { ShadowSection } from '../../reports/styled';
import { useQuery } from '@tanstack/react-query';
import LoadingModal from '../Modals/LoadingModal';

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

  const { data: settings, refetch: refetchSettings } = useQuery({
    queryKey: ['shut-down', companyId],
    queryFn: async () => {
      const response = await axios.get(
        getAdminApiUrl(companyId, '/settings/get-shut-down'),
      );
      return response.data.data;
    },
    enabled: !!companyId,
  });

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

  const handleUpdateShutDown = async (isShutDown: boolean) => {
    try {
      setIsSubmitting(true);
      const response = await axios.put(
        getAdminApiUrl(companyId, '/settings/update-shut-down'),
        {
          isShutDown: isShutDown,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsSubmitting(false);
        return;
      }

      showNotification('success', response.data.message);
      await refetchSettings();
      setIsSubmitting(false);
    } catch (error: any) {
      console.log('Fail to update shut down: ', error);
      showNotification('error', 'Fail to update shut down: ' + error);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <LoadingModal open={isSubmitting} />
      {NotificationComp}
      {/* Shut Down Section */}
      <ShadowSection
        $backgroundColor={settings?.isShutDown ? orange[50] : green[50]}
        sx={{
          border: `2px solid ${settings?.isShutDown ? orange[400] : green[300]}`,
          transition: 'all 0.3s ease',
        }}
      >
        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          gap={{ xs: 2, sm: 3 }}
        >
          <Box
            display="flex"
            alignItems="center"
            gap={2.5}
            flex={1}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: settings?.isShutDown
                  ? orange[200]
                  : green[200],
                color: settings?.isShutDown ? orange[800] : green[800],
                transition: 'all 0.3s ease',
                boxShadow: `0 4px 12px ${settings?.isShutDown ? orange[300] : green[300]}40`,
              }}
            >
              {settings?.isShutDown ? (
                <Warning sx={{ fontSize: 32 }} />
              ) : (
                <PowerSettingsNew sx={{ fontSize: 32 }} />
              )}
            </Box>
            <Box>
              <Box
                display="flex"
                alignItems="center"
                gap={1.5}
                mb={0.5}
                flexWrap="wrap"
              >
                <Typography
                  variant="h6"
                  color={blueGrey[900]}
                  sx={{ fontWeight: 700 }}
                >
                  Client Side
                </Typography>
                <Chip
                  label={settings?.isShutDown ? 'Shut Down' : 'Active'}
                  color={settings?.isShutDown ? 'warning' : 'success'}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    height: 24,
                    '& .MuiChip-label': {
                      px: 1.5,
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  color="warning"
                  checked={settings?.isShutDown || false}
                  onChange={(e: any) => {
                    handleUpdateShutDown(e.target.checked);
                  }}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: orange[700],
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: orange[500],
                    },
                    '& .MuiSwitch-track': {
                      backgroundColor: green[400],
                    },
                  }}
                />
              }
              label=""
              sx={{
                margin: 0,
              }}
            />
          </Box>
        </Box>
      </ShadowSection>
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
