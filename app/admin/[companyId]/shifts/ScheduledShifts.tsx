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

export default function ScheduledShifts() {
  const { companyId }: any = useParams();

  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [isSavingAll, setIsSavingAll] = useState<boolean>(false);
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
    const totalCost = scheduledShifts.reduce(
      (acc, shift) =>
        acc + (shift.hours || 0) * (shift.employee?.hourlyRate || 0),
      0,
    );
    return {
      totalShifts: scheduledShifts.length,
      totalHours,
      totalCost,
    };
  }, [scheduledShifts]);

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

  const handleSaveAll = async (newShifts: IScheduledShift[] = []) => {
    try {
      setIsSavingAll(true);
      const response = await axios.post(
        getAdminApiUrl(companyId, '/scheduled-shifts/save-all'),
        {
          shifts: newShifts.length > 0 ? newShifts : scheduledShifts,
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
        <LoadingButton
          loading={isSavingAll}
          onClick={() => handleSaveAll()}
          variant="contained"
          color="primary"
        >
          Save All
        </LoadingButton>
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
