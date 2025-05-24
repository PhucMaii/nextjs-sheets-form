import { Box, Grid, Typography } from '@mui/material';
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
      id: eventInfo.draggedEl.getAttribute('data-id'),
      title: eventInfo.draggedEl.getAttribute('title'),
      color: eventInfo.draggedEl.getAttribute('data-color'),
      duration: "1:00",
      start: eventInfo.event._instance.range.start,
      end: eventInfo.event._instance.range.end,
      custom: eventInfo.draggedEl.getAttribute('data-custom'),
    };

    console.log(eventInfo.event._instance.range, 'eventInfo');


    setEvents((state) => {
      return {
        ...state,
        shifts: state.shifts.concat(newEvent),
      };
    });
  };

  console.log(events, 'events');

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
            {events.employees.length > 0 ? (
              events.employees.map((employee: any) => (
                <Box
                  key={employee.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: `1px solid ${primary.lightest}`,
                    borderRadius: 1,
                    p: 1,
                  }}
                  className="fc-event fc-h-event fc-daygrid-event fc-daygrid-block-event fc-daygrid-block-event-dot"
                  data-id={employee.id}
                  data-color={primary.main}
                  data-custom={employee.name}
                  title={employee.name}
                >
                  <div className="fc-event-main">
                  <Typography variant="body1">{employee.name}</Typography>

                  </div>
                </Box>
              ))
            ) : (
              <Typography variant="body1">No employees found</Typography>
            )}
          </Grid>
          <Grid item xs={12} md={10.5}>
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
              initialView="timeGridWeek"
              events={events.shifts}
              droppable={true}
              selectable={true}
              editable={true}
              dayMaxEvents={true}
              weekends={true}
              // selectMirror={true}
              eventDurationEditable={true}
              defaultTimedEventDuration="01:00"
              eventReceive={handleEventReceive}
            />
          </Grid>
        </Grid>
      </ShadowSection>
    </>
  );
}
