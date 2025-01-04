'use client';
import React, { useEffect, useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar/Sidebar'
import { Box, Tab, Tabs, Typography, useMediaQuery } from '@mui/material'
import { blueGrey } from '@mui/material/colors'
import { ShadowSection } from '../reports/styled'
import { days, limitOrderHour } from '@/app/lib/constant';
import { YYYYMMDDFormat } from '@/prisma/seed';
import { infoBackground, infoColor } from '@/theme/color';
import { IRoutes } from '@/app/utils/type';
import { API_URL } from '@/app/utils/enum';
import { SWRFetchData } from '@/app/utils/db';

export default function Statements() {
    const [dayIndex, setDayIndex] = useState<number>(0);
    const [routeIndex, setRouteIndex] = useState<number>(0);

    const [routesResponse] = SWRFetchData(
        `${API_URL.ROUTES}?day=${days[dayIndex]}`,
    );
    

    const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

    const recommendDate = useMemo(() => {
        // format initial date
        const dateObj = new Date();
        // if current hour is greater limit hour, then recommend the next day
        if (dateObj.getHours() >= limitOrderHour) {
          dateObj.setDate(dateObj.getDate() + 1);
        }
    
        const formattedDate = YYYYMMDDFormat(dateObj);
    
        return { day: days[dateObj.getDay()], deliveryDate: formattedDate };
      }, []);

    useEffect(() => {
        if (recommendDate) {
            setDayIndex(days.indexOf(recommendDate.day));
        }
    }, [recommendDate]);

    const switchDay = (newValue: number) => {
        setDayIndex(newValue);
    };
    
  return (
    <Sidebar>
        <Typography variant="h5" color={blueGrey[800]}>
          Statements
        </Typography>

        <ShadowSection display="flex" flexDirection="column" gap={2}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                aria-label="basic tabs"
                value={dayIndex}
                onChange={(e, newValue: number) => switchDay(newValue)}
                variant={mdDown ? 'scrollable' : 'fullWidth'}
                scrollButtons="auto"
              >
                {days &&
                  days.map((day: string, index: number) => {
                    return (
                      <Tab
                        key={index}
                        id={`simple-tab-${index}`}
                        label={`${day} ${recommendDate.day === day ? '•' : ''}`}
                        aria-controls={`tabpanel-${index}`}
                        value={index}
                      />
                    );
                  })}
              </Tabs>
            </Box>

            <Tabs
                  orientation='horizontal'
                  aria-label="basic tabs"
                  value={routeIndex}
                  onChange={(e, newValue) => setRouteIndex(newValue)}
                  variant="fullWidth"
                  sx={{
                    '& button': { borderRadius: 2 },
                    '& button:hover': {
                      boxShadow:
                        'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px',
                    },
                    '& button:active': {
                      boxShadow:
                        'rgba(50, 50, 93, 0.25) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset',
                    },
                    '& button.Mui-selected': {
                      backgroundColor: infoBackground,
                      color: infoColor,
                      boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px;',
                    },
                  }}
                >
                  {routesResponse && routesResponse?.data.length > 0 &&
                    routesResponse?.data.map((route: IRoutes, index: number) => {
                      return (
                        <Tab
                          key={index}
                          id={`simple-tab-${index}`}
                          label={`${route.name} - ${route?.driver?.name}`}
                          aria-controls={`tabpanel-${index}`}
                          value={index}
                        />
                      );
                    })}
                </Tabs>
        </ShadowSection>
    </Sidebar>
  )
}
