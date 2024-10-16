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
import InsertOrderToCodBoard from '../components/Modals/add/InsertOrderToCodBoard';
import axios from 'axios';
import DeleteModal from '../components/Modals/delete/DeleteModal';

export default function CodBoard() {
  const [selectedBoard, setSelectedBoard] = useState<IBoard | null>(null);
  const [deleteBoard, setDeleteBoard] = useState<{
    isOpen: boolean;
    id: number;
  }>({ isOpen: false, id: -1 });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOpenAddBoard, setIsOpenAddBoard] = useState<boolean>(false);
  const [isOpenInsertOrders, setIsOpenInsertOrders] = useState<boolean>(false);
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

  return (
    <Sidebar>
      <DeleteModal
        open={deleteBoard.isOpen}
        handleCloseModal={() => setDeleteBoard({ id: -1, isOpen: false })}
        targetObj={deleteBoard.id}
        handleDelete={handleDeleteBoard}
      />
      <InsertOrderToCodBoard
        open={isOpenInsertOrders}
        onClose={() => setIsOpenInsertOrders(false)}
        currentDate={date}
        showNotification={showNotification}
        boardId={selectedBoard?.id || -1}
        mutateBoards={mutateBoards}
      />
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
          setSelectedBoard={setSelectedBoard}
          // onClose={() => setSelectedBoard(null)}
          showNotification={showNotification}
          setIsOpenInsertOrders={setIsOpenInsertOrders}
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
              ) : codBoards && codBoards.data.length > 0 ? (
                codBoards?.data.map((board: any) => (
                  <CODBoardSummary
                    key={board.id}
                    boardData={board}
                    onSelect={() => setSelectedBoard(board)}
                    handleDeleteBoard={() =>
                      setDeleteBoard({ isOpen: true, id: board.id })
                    }
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
