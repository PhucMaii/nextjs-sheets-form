import { Box, Divider, Grid, Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import '../../../styles/swiper.css';
import { generateWeekRange } from '@/app/utils/time';
import { getDaysOfThisWeek } from '@/pages/api/utils/date';
import { blue, grey } from '@mui/material/colors';
import { ShadowSection } from '@/app/admin/[companyId]/reports/styled';

export default function UpcomingShifts() {
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

  return (
    <Box sx={{ height: '100%' }}>
      {/* Date Scroll Picker */}
      <Swiper
        modules={[]}
        navigation
        pagination={{ clickable: true }}
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
                <Typography
                  sx={{
                    color: selectedDate === day ? 'white' : blue[600],
                    fontWeight: 1000,
                  }}
                >
                  •
                </Typography>
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

      <ShadowSection>
        <Grid container spacing={2}>
          <Grid
            item
            xs={8}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Typography variant="body1" fontWeight={600}>
              NGUYEN
            </Typography>

            <Box
              display="flex"
              flexDirection="column"
              gap={0.5}
              sx={{ width: 'fit-content' }}
            >
              <Typography
                variant="body1"
                sx={{ color: grey[600] }}
                fontWeight={400}
              >
                6:30 - 10:30
              </Typography>
              <Divider />
              <Typography
                variant="body1"
                sx={{ color: grey[600] }}
                fontWeight={400}
              >
                4 hours
              </Typography>
            </Box>
          </Grid>
          <Grid
            item
            xs={4}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              alignItems: 'flex-end',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="body1" fontWeight={400}>
              Driver
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              Est: $100.00
            </Typography>
          </Grid>
        </Grid>
      </ShadowSection>
    </Box>
  );
}
