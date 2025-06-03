'use client';
import React, { useContext, useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import {
  Box,
  Grid,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { ShadowSection } from '../../reports/styled';
import { blueGrey } from '@mui/material/colors';
import { useParams, useRouter } from 'next/navigation';
import { fetchApi } from '@/app/utils/db';
import { EMPLOYEE_ROLE, getAdminApiUrl } from '@/app/utils/enum';
import { LoadingButton } from '@mui/lab';
import usePageViews from '@/hooks/autocomplete/usePageViews';
import PageViewTable from '../../components/Tables/PageViewTable';
import axios from 'axios';
import useNotification from '@/hooks/useNotification';
import { ArrowLeftIcon } from 'lucide-react';
import { UserContext } from '@/app/context/UserContextAPI';
import { PayrollType } from '@prisma/client';

export default function EmployeeDetailPage() {
  const { user }: any = useContext(UserContext);
  const { id, companyId }: any = useParams();
  const router = useRouter();

  const [employee, setEmployee] = useState<any>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const { renderPageViewSearch, selectedPageViews, setSelectedPageViews } = usePageViews(employee?.adminPages || []);

  const { showNotification, NotificationComp } = useNotification();

  useEffect(() => {
    if (user && user?.role !== EMPLOYEE_ROLE.SUPER_ADMIN) {
      showNotification('error', 'You are not authorized to view this page');
      router.push(`/admin/${companyId}/employees`);
      return;
    }
  }, [user, companyId, router]);

  useEffect(() => {
    const fetchEmployee = async () => {
      const data = await fetchApi(
        getAdminApiUrl(companyId, `/employees?employeeId=${id}`),
      );

      setEmployee(data);
    };

    fetchEmployee();
  }, [id]);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const pageViews = selectedPageViews.map((pageView: any) => ({
        employeeId: employee?.id,
        pageId: pageView.id,
      }));

      const response = await axios.put(getAdminApiUrl(companyId, `/employees`), {
        employeeId: employee?.id,
        updatedFields: {
          name: employee?.name,
          employeeCode: employee?.employeeCode,
          payRate: employee?.payRate,
          role: employee?.role,
          payrollType: employee?.payrollType,
        },
        pageViews,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
      } else {
        showNotification('success', response.data.message);
        router.push(`/admin/${companyId}/employees`);
      }

    } catch (error: any) {
      console.error('There was an error: ', error);
      showNotification('error', error?.response?.data?.error || 'There was an error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sidebar>
      {NotificationComp}
      <ShadowSection>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton onClick={() => router.back()}>
              <ArrowLeftIcon />
            </IconButton>
            <Typography
              variant="h5"
              sx={{ fontWeight: 'normal' }}
              color={blueGrey[800]}
            >
              Employee Details
            </Typography>

          </Box>
          <LoadingButton variant="contained" color="primary" onClick={handleSave} loading={isSaving}>
            Save
          </LoadingButton>
        </Box>

        <Grid container spacing={2} mt={2}>
          <Grid
            item
            xs={12}
            md={6}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Typography variant="h6" color={blueGrey[800]}>
              Name
            </Typography>
            <TextField
              fullWidth
              value={employee?.name}
              onChange={(e) =>
                setEmployee({ ...employee, name: e.target.value })
              }
            />
          </Grid>

          <Grid
            item
            xs={12}
            md={6}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Typography variant="h6" color={blueGrey[800]}>
              Employee Code
            </Typography>
            <TextField
              fullWidth
              value={employee?.employeeCode}
              onChange={(e) =>
                setEmployee({ ...employee, employeeCode: e.target.value })
              }
            />
          </Grid>

          <Grid
            item
            xs={12}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Typography variant="h6" color={blueGrey[800]}>
              Role
            </Typography>
            <Select
              fullWidth
              value={employee?.role || ''}
              onChange={(e) =>
                setEmployee({ ...employee, role: e.target.value })
              }
            >
              {Object.values(EMPLOYEE_ROLE).map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="h6" color={blueGrey[800]}>
              Payroll Type
            </Typography>
            <Select
              fullWidth
              value={employee?.payrollType || ''}
              onChange={(e) =>
                setEmployee({ ...employee, payrollType: e.target.value })
              }
            >
              {Object.values(PayrollType).map((payrollType) => (
                <MenuItem key={payrollType} value={payrollType}>
                  {payrollType}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          <Grid
            item
            xs={12}
            md={6}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Typography variant="h6" color={blueGrey[800]}>
              Pay Rate
            </Typography>
            <TextField
              fullWidth
              value={employee?.payRate}
              onChange={(e) =>
                setEmployee({ ...employee, payRate: +e.target.value })
              }
            />
          </Grid>

          {employee?.role === 'admin' && (
            <>
              <Grid
                item
                xs={12}
                sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
              >
                <Typography variant="h6" color={blueGrey[800]}>
                  Page Views
                </Typography>
                {renderPageViewSearch()}
              </Grid>

              <PageViewTable pageViews={selectedPageViews} setPageViews={setSelectedPageViews} />
            </>
          )}

        </Grid>
      </ShadowSection>

    </Sidebar>
  );
}
