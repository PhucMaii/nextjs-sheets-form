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

export default function ScheduledShifts() {
  const { companyId }: any = useParams();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<any>(null);
  const [openAddScheduledShift, setOpenAddScheduledShift] = useState<any>({
    isOpen: false,
    defaultEmployee: null,
    defaultDate: null,
  });

  const { showNotification, NotificationComp } = useNotification();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const data = await fetchApi(
      getAdminApiUrl(companyId, '/employees'),
      showNotification,
    );

    setEmployees(data);
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
        defaultEmployee={openAddScheduledShift?.defaultEmployee}
        defaultDate={openAddScheduledShift?.defaultDate}
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
          shifts={[
            {
              startedAt: '08:00',
              endedAt: '11:00',
              employeeId: 13,
              companyId: companyId,
              employee: {
                id: 13,
                name: 'PETER',
                role: 'driver',
              },
              day: 'Monday',
              hours: 3,
            },
          ]}
          selectedWeek={selectedWeek}
        />
      </ShadowSection>
    </>
  );
}
