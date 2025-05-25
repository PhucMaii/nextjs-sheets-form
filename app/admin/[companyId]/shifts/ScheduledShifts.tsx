import { Box, Divider, Grid, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ShadowSection } from '../reports/styled';
import FullCalendar from '@fullcalendar/react';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction'; //
import dayGridPlugin from '@fullcalendar/daygrid';
import '../../../../styles/fullCalendar.css';
import timeGridPlugin from '@fullcalendar/timegrid';
import { fetchApi } from '@/app/utils/db';
import { getAdminApiUrl } from '@/app/utils/enum';
import { useParams } from 'next/navigation';
import useNotification from '@/hooks/useNotification';
import { grey } from '@mui/material/colors';
import { primary } from '@/theme/color';

export default function ScheduledShifts() {
  const { companyId }: any = useParams();

  const [events, setEvents] = useState({
    employees: [],
    shifts: [
      {
        title: 'Shift 1',
        start: '2025-05-23T08:00:00',
        end: '2025-05-23T11:00:00',
      },
    ],
  });

  const { showNotification, NotificationComp } = useNotification();

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    const draggableEl = document.getElementById('employees');
    if (draggableEl) {
      new Draggable(draggableEl, {
        itemSelector: '.fc-event',
        eventData: function (eventEl) {
          const id = eventEl.dataset.id;
          const title = eventEl.getAttribute('title');
          const color = eventEl.dataset.color;
          const custom = eventEl.dataset.custom;

          return {
            id: id,
            title: title,
            color: color,
            custom: custom,
            create: true,
          };
        },
      });
    }
  }, []);

  const handleEventReceive = (eventInfo: any) => {
    const newEvent = {
      id: crypto.randomUUID(),
      title: eventInfo.draggedEl.getAttribute('title'),
      color: eventInfo.draggedEl.getAttribute('data-color'),
      textColor: eventInfo.draggedEl.getAttribute('data-text-color'),
      duration: '1:00',
      start: eventInfo.event.start,
      end: eventInfo.event.end,
      custom: eventInfo.draggedEl.getAttribute('data-custom'),
    };

    console.log(eventInfo.event._instance.range, 'eventInfo');

    const newShifts = [...events.shifts, newEvent];

    setEvents((state) => {
      return {
        ...state,
        shifts: newShifts,
      };
    });
  };

  const handleEventDrop = (event: any) => {
    const targetShift: any = events.shifts.find(
      (shift: any) => shift.id === event.event.id,
    );

    const newShifts = events.shifts.map((shift: any) => {
      if (targetShift?.id && shift.id === targetShift.id) {
        return {
          ...shift,
          start: event.event.start,
          end: event.event.end,
        };
      }
      return shift;
    });

    setEvents((state) => {
      return {
        ...state,
        shifts: newShifts,
      };
    });
  };

  const fetchEmployees = async () => {
    const data = await fetchApi(
      getAdminApiUrl(companyId, '/employees'),
      showNotification,
    );
    setEvents((state) => {
      return {
        ...state,
        employees: data,
      };
    });
  };

  return (
    <>
      {NotificationComp}
      <Typography variant="h6">Schedule</Typography>

      <ShadowSection>
        <Grid container>
          <Grid item xs={12} md={1.5} id="employees">
            <Typography variant="h6">Employees</Typography>

            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}>

            {events.employees.length > 0 ? (
              events.employees.map((employee: any) => (
                <Box
                  key={employee.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    // border: `1px solid ${grey[50]}`,
                    borderRadius: 1,
                    py: 0.5,
                    px: 1,
                    fontWeight: 'semibold',
                    cursor: 'pointer',
                    backgroundColor: grey[50],
                  }}
                  className="fc-event fc-h-event fc-daygrid-event fc-daygrid-block-event fc-daygrid-block-event-dot"
                  data-id={employee.id}
                  data-color={primary.main}
                  data-custom={employee}
                  title={employee.name}
                >
                  <div className="fc-event-main">
                    <Typography variant="body1">{employee.name}</Typography>
                  </div>
                  <Divider />
                </Box>
              ))
            ) : (
              <Typography variant="body1">No employees found</Typography>
            )}
            </Box>
          </Grid>
          <Grid item xs={12} md={10.5}>
            <FullCalendar
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
              initialView="dayGridMonth"
              editable={true}
              selectable={true}
              // selectMirror={true}
              dayMaxEvents={true}
              weekends={true}
              events={events.shifts}
              droppable={true}
              eventReceive={handleEventReceive}
              eventDrop={handleEventDrop}
              allDaySlot={false}
            />
          </Grid>
        </Grid>
      </ShadowSection>
    </>
  );
}
