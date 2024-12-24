/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';
import { ShadowSection } from '../reports/styled';
import { blueGrey } from '@mui/material/colors';
import CODBoardSummary from '../components/CODBoard/CODBoardSummary';
import AddIcon from '@mui/icons-material/Add';
import {
  generateCurrentTime,
  generateMonthRange,
  YYYYMMDDFormat,
} from '@/app/utils/time';
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
import { useMultipleBoolean } from '@/hooks/useMultipleBoolean';
import useSelectDate from '@/hooks/useSelectDate';
import CodOverview from '../components/Overview/CodOverview';

export default function CodBoard() {
  const [dateRange, setDateRange] = useState<any>(() => generateMonthRange());
  const [isSingleDate, setIsSingleDate] = useState<boolean>(false);
  const [selectedBoard, setSelectedBoard] = useState<IBoard | any>(null);
  const [deleteBoard, setDeleteBoard] = useState<{
    isOpen: boolean;
    id: number;
  }>({ isOpen: false, id: -1 });
  const [loading, setLoading] = useMultipleBoolean({
    isFetching: true,
    isCheckingAutoAddBoard: false,
  });
  const [isOpenAddBoard, setIsOpenAddBoard] = useState<boolean>(false);
  const { showNotification, NotificationComp } = useNotification();

  const today = new Date();
  const todayString = YYYYMMDDFormat(today);

  const { date, SelectDate } = useSelectDate(todayString);

  // Data Fetching
  const [codBoards, mutateBoards, isValidating] = SWRFetchData(
    isSingleDate
      ? `${API_URL.ADMIN}/cod?date=${date}`
      : `${API_URL.ADMIN}/cod?startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
  );

  useEffect(() => {
    handleAutoAddBoard();
  }, [date, selectedBoard]);

  useEffect(() => {
    if (!codBoards) {
      setLoading('isFetching', true);
    } else {
      setLoading('isFetching', false);
    }
  }, [codBoards, isValidating]);

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

  const handleAutoAddBoard = async () => {
    setLoading('isCheckingAutoAddBoard', true);
    try {
      const createdAt = generateCurrentTime();
      const response = await axios.post(`${API_URL.ADMIN}/cod/auto-add-board`, {
        todayString: date,
        createdAt,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        setLoading('isCheckingAutoAddBoard', false);
        return;
      }

      mutateBoards();

      setLoading('isCheckingAutoAddBoard', false);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', error.response.data.error);

      setLoading('isCheckingAutoAddBoard', false);
    }
  };

  if (selectedBoard) {
    return (
      <Sidebar>
        <CODBoardDetails
          boardData={selectedBoard}
          onClose={() => setSelectedBoard(null)}
          isAutoAddBoard={loading.isCheckingAutoAddBoard}
        />
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      {NotificationComp}
      <DeleteModal
        open={deleteBoard.isOpen}
        handleCloseModal={() => setDeleteBoard({ id: -1, isOpen: false })}
        targetObj={deleteBoard.id}
        handleDelete={handleDeleteBoard}
      />
      <AddCodBoard
        open={isOpenAddBoard}
        onClose={() => setIsOpenAddBoard(false)}
        currentDate={todayString}
        showNotification={showNotification}
      />

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5" color={blueGrey[800]}>
          C.O.D Board
        </Typography>

        <Box display="flex" gap={1} alignItems="center">
          <FormControlLabel
            control={
              <Switch
                checked={isSingleDate}
                onChange={(e) => setIsSingleDate(e.target.checked)}
              />
            }
            label="Single Date"
          />
          {isSingleDate ? (
            <>{SelectDate}</>
          ) : (
            <SelectDateRange
              dateRange={dateRange}
              setDateRange={setDateRange}
            />
          )}
        </Box>
      </Box>

      {/* Overview */}

      <CodOverview codBoards={codBoards?.data} />
      {/* <CodOverview /> */}

      <ShadowSection>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" color={blueGrey[800]}>
            Boards
          </Typography>
          <Button variant="outlined" onClick={() => setIsOpenAddBoard(true)}>
            <Box display="flex" alignItems="center" gap={1}>
              <AddIcon />
              <Typography variant="body2" fontWeight={600}>
                New Board
              </Typography>
            </Box>
          </Button>
        </Box>
        {loading.isCheckingAutoAddBoard && (
          <Box mt={2}>
            <Typography variant="body2">
              We are checking for new boards...
            </Typography>
          </Box>
        )}
      </ShadowSection>

      <Box display="flex" flexDirection="column" gap={4} mt={2}>
        {loading.isFetching ? (
          <LoadingComponent />
        ) : isSingleDate && codBoards && codBoards.data.length > 0 ? (
          codBoards.data.map((board: IBoard) => (
            <CODBoardSummary
              key={board.id}
              boardData={board}
              onSelect={() => setSelectedBoard(board)}
              handleDeleteBoard={() =>
                setDeleteBoard({ isOpen: true, id: board.id })
              }
              showNotification={showNotification}
            />
          ))
        ) : codBoards?.sortedDate && codBoards?.sortedDate.length > 0 ? (
          codBoards?.sortedDate.map((date: string, index: number) => (
            <Box key={index} display="flex" flexDirection="column" gap={2}>
              <Divider textAlign="center">
                <Typography variant="h6" color={blueGrey[800]}>
                  {date}
                </Typography>
              </Divider>
              {codBoards?.data[date].map((board: IBoard) => (
                <CODBoardSummary
                  key={board.id}
                  boardData={board}
                  onSelect={() => setSelectedBoard(board)}
                  handleDeleteBoard={() =>
                    setDeleteBoard({ isOpen: true, id: board.id })
                  }
                  showNotification={showNotification}
                />
              ))}
            </Box>
          ))
        ) : (
          <ErrorComponent errorText="No boards found" />
        )}
      </Box>
    </Sidebar>
  );
}
