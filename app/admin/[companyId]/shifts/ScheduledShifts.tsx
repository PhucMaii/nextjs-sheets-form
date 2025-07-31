import { Box, Grid, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { ShadowSection } from '../reports/styled';
import '../../../../styles/fullCalendar.css';
import { fetchApi } from '@/app/utils/db';
import { getAdminApiUrl } from '@/app/utils/enum';
import { useParams } from 'next/navigation';
import useNotification from '@/hooks/useNotification';
import SelectWeek from '../components/Select/SelectWeek';
import ScheduledShiftTable from '../components/ScheduledShifts/ScheduledShiftTable';
import { Employee } from '@prisma/client';
import AddScheduledShift from '../components/Modals/add/AddScheduledShift';
import { getRole } from '@/pages/api/utils/employee';
import { generateWeekRange } from '@/app/utils/time';
import { IEmployee, IScheduledShift } from '@/app/utils/type';
import axios from 'axios';
import { LoadingButton } from '@mui/lab';
import dayjs from 'dayjs';
import { PayrollType } from '@prisma/client';

export default function ScheduledShifts() {
  const { companyId }: any = useParams();

  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [isSavingAll, setIsSavingAll] = useState<boolean>(false);
  const [isCopyingLastWeek, setIsCopyingLastWeek] = useState<boolean>(false);
  const [baseScheduledShifts, setBaseScheduledShifts] = useState<
    IScheduledShift[]
  >([]);
  const [scheduledShifts, setScheduledShifts] = useState<IScheduledShift[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<any>(generateWeekRange());
  const [openAddScheduledShift, setOpenAddScheduledShift] = useState<any>({
    isOpen: false,
    defaultEmployee: null,
    defaultDate: null,
  });

  const { showNotification, NotificationComp } = useNotification();

  const overview = useMemo(() => {
    if (scheduledShifts.length === 0)
      return {
        totalShifts: 0,
        totalHours: 0,
        totalCost: 0,
      };
    const totalHours = scheduledShifts.reduce(
      (acc, shift) => acc + (shift.hours || 0),
      0,
    );

    const hourlyScheduledShifts = scheduledShifts.filter(
      (shift) => shift.employee?.payrollType === PayrollType.hourly,
    );
    const salariedScheduledShifts = scheduledShifts.filter(
      (shift) => shift.employee?.payrollType === PayrollType.monthly,
    );
    const salaryEmployeesInScheduledShifts = employees.filter(
      (employee) =>
        employee.payrollType === PayrollType.monthly &&
        salariedScheduledShifts.some(
          (shift) => shift.employee?.id === employee.id,
        ),
    );

    const totalHourlyCost = hourlyScheduledShifts.reduce(
      (acc, shift) => acc + (shift.hours || 0) * (shift.employee?.payRate || 0),
      0,
    );
    const totalSalaryCost = salaryEmployeesInScheduledShifts.reduce(
      (acc, employee) => acc + (employee?.payRate ? Math.round(employee?.payRate / 4) : 0),
      0,
    );

    const totalCost = totalHourlyCost + totalSalaryCost;

    return {
      totalShifts: scheduledShifts.length,
      totalHours,
      totalCost,
    };
  }, [scheduledShifts, employees]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (
      JSON.stringify(baseScheduledShifts) !== JSON.stringify(scheduledShifts)
    ) {
      showNotification('info', 'Shifts needs to be saved');
    }
  }, [scheduledShifts]);

  useEffect(() => {
    fetchScheduledShifts();
  }, [selectedWeek]);

  const fetchEmployees = async () => {
    const data = await fetchApi(
      getAdminApiUrl(companyId, '/employees'),
      showNotification,
    );

    setEmployees(data);
  };

  const fetchScheduledShifts = async () => {
    const data = await fetchApi(
      getAdminApiUrl(
        companyId,
        '/scheduled-shifts',
        `startDate=${selectedWeek[0]}&endDate=${selectedWeek[1]}`,
      ),
      showNotification,
    );
    setBaseScheduledShifts(data);
    setScheduledShifts(data);
  };

  const handleSaveAll = async (newShifts: IScheduledShift[] | null = null) => {
    try {
      setIsSavingAll(true);
      const response = await axios.post(
        getAdminApiUrl(companyId, '/scheduled-shifts/save-all'),
        {
          shifts: newShifts ? newShifts : scheduledShifts,
          startedAt: selectedWeek[0].toString(),
          endedAt: selectedWeek[1].toString(),
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      setScheduledShifts(response.data.data);
      setBaseScheduledShifts(response.data.data);
      showNotification('success', 'Shifts saved successfully');
      // fetchScheduledShifts();
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', 'Something went wrong: ' + error);
    } finally {
      setIsSavingAll(false);
    }
  };

  const onOpenAddScheduledShift = (employee: Employee, date: string) => {
    setOpenAddScheduledShift({
      isOpen: true,
      defaultEmployee: getRole(employee?.role || '', employee?.name || ''),
      defaultDate: date,
    });
  };

  const handleCopyLastWeek = async () => {
    try {
      setIsCopyingLastWeek(true);
      const lastWeekStartedDate = dayjs(selectedWeek[0])
        .subtract(7, 'day')
        .toString();
      const lastWeekEndedDate = dayjs(selectedWeek[1])
        .subtract(8, 'day')
        .toString();

      const currentWeekStartedDate = dayjs(selectedWeek[0]).toString();
      const currentWeekEndedDate = dayjs(selectedWeek[1]).toString();

      const response = await axios.post(
        getAdminApiUrl(companyId, '/scheduled-shifts/copy-last-week'),
        {
          lastWeekStartedDate,
          lastWeekEndedDate,
          currentWeekStartedDate,
          currentWeekEndedDate,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      await fetchScheduledShifts();

      showNotification('success', 'Shifts copied successfully');
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', 'Something went wrong: ' + error);
    } finally {
      setIsCopyingLastWeek(false);
    }
  };

  return (
    <>
      {NotificationComp}
      <AddScheduledShift
        shifts={scheduledShifts}
        open={openAddScheduledShift.isOpen}
        onClose={() =>
          setOpenAddScheduledShift({
            isOpen: false,
            defaultEmployee: null,
            defaultDate: null,
          })
        }
        showNotification={showNotification}
        defaultEmployee={openAddScheduledShift?.defaultEmployee}
        defaultDate={openAddScheduledShift?.defaultDate}
        refresh={handleSaveAll}
      />
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        width="100%"
      >
        <Typography variant="h6">Schedule</Typography>

        <Box display="flex" alignItems="center" gap={1}>
          <LoadingButton
            loading={isCopyingLastWeek}
            onClick={() => handleCopyLastWeek()}
            variant="outlined"
            color="primary"
            disabled={scheduledShifts.length > 0}
          >
            Copy Last Week
          </LoadingButton>
          <LoadingButton
            loading={isSavingAll}
            onClick={() => handleSaveAll()}
            variant="contained"
            color="primary"
          >
            Save All
          </LoadingButton>
        </Box>
      </Box>
      <ShadowSection>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={4}>
            <Typography fontWeight="medium">
              Total: {overview.totalShifts} shifts
            </Typography>
          </Grid>
          <Grid item xs={4} textAlign="center">
            <SelectWeek
              selectedWeek={selectedWeek}
              setSelectedWeek={setSelectedWeek}
              variant="standard"
            />
          </Grid>
          <Grid
            item
            xs={4}
            textAlign="right"
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography fontWeight="medium">
              {overview.totalHours?.toFixed(1)} hours
            </Typography>
            <Typography fontWeight="medium">
              • ${overview.totalCost?.toFixed(2)}
            </Typography>
          </Grid>
        </Grid>

        <ScheduledShiftTable
          onOpenAddShift={onOpenAddScheduledShift}
          employees={employees}
          shifts={scheduledShifts}
          selectedWeek={selectedWeek}
          setShifts={setScheduledShifts}
          showNotification={showNotification}
          refresh={handleSaveAll}
        />
      </ShadowSection>
    </>
  );
}
