import { Box, Divider, Grid, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import '../../../styles/swiper.css';
import { generateWeekRange } from '@/app/utils/time';
import { getDaysOfThisWeek } from '@/pages/api/utils/date';
import { blue, grey } from '@mui/material/colors';
import { IScheduledShift } from '@/app/utils/type';
import { fetchApi } from '@/app/utils/db';
import UpcomingShift from '../components/UpcomingShift';
import SelectWeek from '@/app/admin/[companyId]/components/Select/SelectWeek';
import ErrorComponent from '@/app/admin/[companyId]/components/ErrorComponent';

export default function UpcomingShifts() {
  const [shiftsInRange, setShiftsInRange] = useState<IScheduledShift[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { dateStyle: 'full' });
  });

  const [selectedWeek, setSelectedWeek] = useState<any>(() =>
    generateWeekRange(),
  );

  const daysInWeek = useMemo(() => {
    if (!selectedWeek) return [];
    const dates = getDaysOfThisWeek(selectedWeek[0], selectedWeek[1]);
    return dates;
  }, [selectedWeek]);

  const shiftsInDate = useMemo(() => {
    if (shiftsInRange.length > 0 && selectedDate) {
      return shiftsInRange.filter((shift) => shift.date === selectedDate);
    }
    return [];
  }, [shiftsInRange, selectedDate]);

  const overviewData = useMemo(() => {
    if (shiftsInRange.length === 0) return { shifts: 0, hours: 0 };

    return {
      shifts: shiftsInRange.length,
      hours: shiftsInRange.reduce((acc, shift) => acc + (shift.hours || 0), 0),
    };
  }, [shiftsInRange]);

  useEffect(() => {
    fetchScheduledShifts();

    if (daysInWeek.length > 0) {
      const today = new Date();
      const todayString = today.toLocaleDateString('en-US', {
        dateStyle: 'full',
      });

      const isInThisWeek = daysInWeek.includes(todayString);
      if (isInThisWeek) {
        setSelectedDate(todayString);
      } else {
        setSelectedDate(daysInWeek[0]);
      }
    }
  }, [selectedWeek, daysInWeek]);

  const fetchScheduledShifts = async () => {
    const data = await fetchApi(
      `/api/drivers/scheduled-shifts?startedDate=${selectedWeek[0]}&endedDate=${selectedWeek[1]}`,
    );
    setShiftsInRange(data || []);
  };

  return (
    <Box sx={{ height: '100%' }}>
      {/* Date Scroll Picker */}
      <Grid container alignItems="center" sx={{ mt: 2 }}>
        <Grid item xs={4}></Grid>
        <Grid item xs={4} textAlign="center">
          <SelectWeek
            selectedWeek={selectedWeek}
            setSelectedWeek={setSelectedWeek}
            // variant="standard"
          />
        </Grid>
        <Grid
          item
          xs={4}
          textAlign="right"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 2,
          }}
        >
          <Box display="flex" flexDirection="column" alignItems="center">
            <Typography fontWeight="medium" variant="body2">
              {overviewData.shifts}
            </Typography>
            <Typography variant="body2" sx={{ color: grey[600] }}>
              shifts
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Typography fontWeight="medium" variant="body2">
              {overviewData.hours.toFixed(1)}
            </Typography>
            <Typography variant="body2" sx={{ color: grey[600] }}>
              hours
            </Typography>
          </Box>
        </Grid>
      </Grid>
      <Swiper
        modules={[]}
        // navigation
        // pagination={{ clickable: true }}
        spaceBetween={10}
        slidesPerView={4}
        style={{ padding: '20px' }}
      >
        {daysInWeek.map((day) => (
          <SwiperSlide key={day}>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              gap={0.2}
              sx={{
                backgroundColor: selectedDate === day ? blue[600] : 'white',
                borderRadius: 1,
                cursor: 'pointer',
                width: 'fit-content',
                padding: 3,
                color: selectedDate === day ? 'white' : '',
              }}
              onClick={() => setSelectedDate(day)}
            >
              <Box display="flex" alignItems="center" justifyContent="center">
                {shiftsInRange.length > 0 &&
                shiftsInRange.find((shift) => shift.date === day) ? (
                  <Typography
                    sx={{
                      color: selectedDate === day ? 'white' : blue[600],
                      fontWeight: 1000,
                    }}
                  >
                    •
                  </Typography>
                ) : null}
              </Box>
              <Typography
                variant="body1"
                sx={{ color: selectedDate === day ? 'white' : grey[600] }}
                fontWeight={selectedDate === day ? 600 : 400}
              >
                {day.split(',')[0].slice(0, 3)}
              </Typography>

              <Typography
                variant="h5"
                fontWeight={selectedDate === day ? 600 : 400}
              >
                {day.split(',')[1].split(' ')[2]}
              </Typography>
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>

      <Divider sx={{ my: 2 }} />
      {/* Shifts List */}

      <Typography fontWeight="medium" sx={{ my: 2 }}>
        {selectedDate}
      </Typography>

      {shiftsInDate.length > 0 ? (
        shiftsInDate.map((shift) => (
          <UpcomingShift key={shift.id} shift={shift} />
        ))
      ) : (
        <ErrorComponent errorText="No shifts scheduled for this date" />
      )}
    </Box>
  );
}
