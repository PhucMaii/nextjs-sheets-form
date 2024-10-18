/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import { Box, Button, Divider, Grid, Typography } from '@mui/material';
import { ShadowSection } from '../reports/styled';
import { blueGrey } from '@mui/material/colors';
import useSelectDate from '@/hooks/useSelectDate';
import CODBoardSummary from '../components/CODBoard/CODBoardSummary';
import AddIcon from '@mui/icons-material/Add';
import { generateMonthRange, YYYYMMDDFormat } from '@/app/utils/time';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import AddCodBoard from '../components/Modals/add/AddCodBoard';
import useNotification from '@/hooks/useNotification';
import ErrorComponent from '../components/ErrorComponent';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import { IBoard } from '@/app/utils/type';
import CODBoardDetails from '../components/CODBoard/CODBoardDetails';
import axios from 'axios';
import DeleteModal from '../components/Modals/delete/DeleteModal';
import SelectDateRange from '../components/SelectDateRange';
import OverviewCard from '../components/OverviewCard/OverviewCard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { primary } from '@/theme/color';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';

export default function CodBoard() {
  const [dateRange, setDateRange] = useState<any>(() => generateMonthRange());
  const [selectedBoard, setSelectedBoard] = useState<IBoard | any>(null);
  const [deleteBoard, setDeleteBoard] = useState<{
    isOpen: boolean;
    id: number;
  }>({ isOpen: false, id: -1 });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOpenAddBoard, setIsOpenAddBoard] = useState<boolean>(false);
  const { showNotification, NotificationComp } = useNotification();

  const today = new Date();
  const todayString = YYYYMMDDFormat(today);

  // Data Fetching
  const [codBoards, mutateBoards, isValidating] = SWRFetchData(
    `${API_URL.ADMIN}/cod?startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
  );

  const totalBoards = useMemo(() => {
    if (!codBoards) {
      return [];
    }

    const boards = Object.keys(codBoards.data).map((key) => {
      return codBoards.data[key];
    }).flat();

    return boards;
  }, [codBoards]);

  const unclearedAmount = useMemo(() => {
    if (!codBoards) {
      return 0;
    }

    const amount = totalBoards.reduce((acc: number, board: any) => {
      return acc + board.uncollected.amount;
    }, 0);

    return amount
  }, [codBoards]);

  const totalCash = useMemo(() => {
    if (!codBoards) {
      return 0;
    }

    const totalCash = totalBoards.reduce((acc: number, board: any) => {
      return acc + board.cash;
    }, 0);

    return totalCash;
  }, [codBoards]);
  
  const sortedDate: any = useMemo(() => {
    if (!codBoards) {
      return [];
    }

    return Object.keys(codBoards.data).sort((key1, key2) => {
      const date1 = new Date(key1);
      const date2 = new Date(key2);

      return date2.getTime() - date1.getTime();
    })
  }, [codBoards]);

  useEffect(() => {
    if (isValidating) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [codBoards]);

  const handleDeleteBoard = async (boardId: number) => {
    try {
      const response = await axios.delete(`${API_URL.ADMIN}/cod?id=${boardId}`);

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      mutateBoards();
      setDeleteBoard({ isOpen: false, id: -1 });
      showNotification('success', response.data.message);
    } catch (error: any) {
      showNotification('error', error.response.data.error);
    }
  };

  if (selectedBoard) {
    return <Sidebar>
      <CODBoardDetails
        boardData={selectedBoard}
        onClose={() => setSelectedBoard(null)}
        showNotification={showNotification}
      />
    </Sidebar>
  }

  return (
    <Sidebar>
      <DeleteModal
        open={deleteBoard.isOpen}
        handleCloseModal={() => setDeleteBoard({ id: -1, isOpen: false })}
        targetObj={deleteBoard.id}
        handleDelete={handleDeleteBoard}
      />
      {NotificationComp}
      <AddCodBoard
        open={isOpenAddBoard}
        onClose={() => setIsOpenAddBoard(false)}
        currentDate={todayString}
        showNotification={showNotification}
      />

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" color={blueGrey[800]}>
            C.O.D Board
          </Typography>
          <SelectDateRange
            dateRange={dateRange}
            setDateRange={setDateRange}
          />
      </Box>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={4} sm={6}>
          <OverviewCard 
            icon={<LocalAtmIcon fontSize="large" color="primary" />}
            text="Total Cash"
            value={totalCash.toFixed(2)}
            backgroundColor={primary.lightest}
            textColor={primary.main}
          />
        </Grid>
        <Grid item xs={12} md={4} sm={6}>
          <OverviewCard 
            icon={<MoneyOffIcon fontSize="large" color="primary" />}
            text="Uncleared Amount"
            value={unclearedAmount.toFixed(2)}
            backgroundColor={primary.lightest}
            textColor={primary.main}
          />
        </Grid>
        <Grid item xs={12} md={4} sm={6}>
          <OverviewCard 
            icon={<AssignmentIcon fontSize="large" color="primary" />}
            text="Total Boards"
            value={totalBoards.length}
            backgroundColor={primary.lightest}
            textColor={primary.main}
          />
        </Grid>
      </Grid>
          {/* <ShadowSection>
            <Typography variant="h6" color={blueGrey[800]}>
              Select date
            </Typography>
            <Box mt={2}>
              <SelectDateRange 
                dateRange={dateRange}
                setDateRange={setDateRange}
              />
            </Box>
          </ShadowSection> */}

          <ShadowSection>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6" color={blueGrey[800]}>
                Boards
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setIsOpenAddBoard(true)}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <AddIcon />
                  <Typography variant="body2" fontWeight={600}>
                    New Board
                  </Typography>
                </Box>
              </Button>
            </Box>

            <Box display="flex" flexDirection="column" gap={4} mt={2}>
              {isLoading ? (
                <LoadingComponent />
              ) : codBoards && sortedDate.length > 0 ? (
                sortedDate.map((date: string, index: number) => (
                  <Box key={index} display="flex" flexDirection="column" gap={2}>
                    <Divider textAlign='center'>
                      <Typography variant="h6" color={blueGrey[800]}>{date}</Typography>
                    </Divider>
                    {codBoards?.data[date].map((board: IBoard) => (
                      <CODBoardSummary
                        key={board.id}
                        boardData={board}
                        onSelect={() => setSelectedBoard(board)}
                        handleDeleteBoard={() =>
                          setDeleteBoard({ isOpen: true, id: board.id })
                        }
                      />
                    ))}
                  </Box>
                ))
              ) : (
                <ErrorComponent errorText="No boards found" />
              )}
            </Box>
          </ShadowSection>
    </Sidebar>
  );
}
