import { Box, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
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

export default function ScheduledShifts() {
  const { companyId }: any = useParams();

  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [scheduledShifts, setScheduledShifts] = useState<IScheduledShift[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<any>(generateWeekRange());
  const [openAddScheduledShift, setOpenAddScheduledShift] = useState<any>({
    isOpen: false,
    defaultEmployee: null,
    defaultDate: null,
  });

  const { showNotification, NotificationComp } = useNotification();

  useEffect(() => {
    fetchEmployees();
  }, []);

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
      getAdminApiUrl(companyId, '/scheduled-shifts', `startDate=${selectedWeek[0]}&endDate=${selectedWeek[1]}`),
      showNotification,
    );
    setScheduledShifts(data);
  };

  const onOpenAddScheduledShift = (employee: Employee, date: string) => {
    setOpenAddScheduledShift({
      isOpen: true,
      defaultEmployee: getRole(
        employee?.role || '',
        employee?.name || '',
      ),
      defaultDate: date,
    });
  };

  return (
    <>
      {NotificationComp}
      <AddScheduledShift  
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
        refresh={fetchScheduledShifts}
        />
      <Typography variant="h6">Schedule</Typography>

      <ShadowSection>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="100%"
        >
          <SelectWeek
            selectedWeek={selectedWeek}
            setSelectedWeek={setSelectedWeek}
            variant="standard"
          />
        </Box>

        <ScheduledShiftTable
          onOpenAddShift={onOpenAddScheduledShift}
          employees={employees}
          shifts={scheduledShifts}
          selectedWeek={selectedWeek}
        />
      </ShadowSection>
    </>
  );
}
