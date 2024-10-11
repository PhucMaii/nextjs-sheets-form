/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import { Box, Button, Typography } from '@mui/material';
import { ShadowSection } from '../reports/styled';
import { blueGrey } from '@mui/material/colors';
import useSelectDate from '@/hooks/useSelectDate';
import CODBoardSummary from '../components/CODBoard/CODBoardSummary';
import AddIcon from '@mui/icons-material/Add';
import { YYYYMMDDFormat } from '@/app/utils/time';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import AddCodBoard from '../components/Modals/add/AddCodBoard';
import useNotification from '@/hooks/useNotification';
import ErrorComponent from '../components/ErrorComponent';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import { IBoard } from '@/app/utils/type';
import CODBoardDetails from '../components/CODBoard/CODBoardDetails';

export default function CodBoard() {
  const [selectedBoard, setSelectedBoard] = useState<IBoard | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOpenAddBoard, setIsOpenAddBoard] = useState<boolean>(false);
  const { showNotification, NotificationComp } = useNotification();

  const today = new Date();
  const todayString = YYYYMMDDFormat(today);
  const { date, SelectDate } = useSelectDate(todayString, true);

  // Data Fetching
  const [codBoards, mutateBoards, isValidating] = SWRFetchData(
    `${API_URL.ADMIN}/cod?date=${date}`,
  );

  useEffect(() => {
    if (isValidating) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [codBoards]);

  return (
    <Sidebar>
      {NotificationComp}
      <AddCodBoard
        open={isOpenAddBoard}
        onClose={() => setIsOpenAddBoard(false)}
        currentDate={date}
        showNotification={showNotification}
      />
      {selectedBoard ? (
        <CODBoardDetails
          boardData={selectedBoard}
          onClose={() => setSelectedBoard(null)}
          showNotification={showNotification}
          mutateBoards={mutateBoards}
        />
      ) : (
        <>
          <Typography variant="h5" color={blueGrey[800]}>
            C.O.D Board
          </Typography>
          <ShadowSection>
            <Typography variant="h6" color={blueGrey[800]}>
              Select date
            </Typography>
            <Box mt={2}>{SelectDate}</Box>
          </ShadowSection>

          <Box>
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

            <Box display="flex" flexDirection="column" gap={1} mt={2}>
              {isLoading ? (
                <LoadingComponent />
              ) : codBoards ? (
                codBoards?.data.map((board: any) => (
                  <CODBoardSummary
                    key={board.id}
                    boardData={board}
                    onSelect={() => setSelectedBoard(board)}
                  />
                ))
              ) : (
                <ErrorComponent errorText="No boards found" />
              )}
            </Box>
          </Box>
        </>
      )}
    </Sidebar>
  );
}
