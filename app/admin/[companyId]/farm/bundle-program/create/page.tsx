'use client';
import { Box, Button, InputAdornment, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { BorderSection } from '../../../reports/styled';
import Sidebar from '../../../components/Sidebar/Sidebar';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import { useParams } from 'next/navigation';
import SmallProgramCard from '../../../components/Farm/SmallProgramCard';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from '@hello-pangea/dnd';
import AddIcon from '@mui/icons-material/Add';

export default function CreateBundleProgram() {
  const { companyId }: any = useParams();

  // Data Fetching
  const { data: programs, refetch: refetchPrograms } = useQuery({
    queryKey: ['programs'],
    queryFn: async () => {
      const response = await axios.get(
        getAdminApiUrl(companyId, '/water-program'),
      );
      return response.data.data;
    },
  });

  const [daySchedules, setDaySchedules] = useState<any[]>([]);

  const onDragEnd = (result: DropResult) => {
    console.log(result);
  };

  return (
    <Sidebar>
      <DragDropContext onDragEnd={onDragEnd}>
        <Box display="flex" flexDirection="column" gap={2}>
          <Typography variant="h4">Create Bundle Program</Typography>

          <BorderSection display="flex" flexDirection="column" gap={1} mt={1}>
            <Typography variant="subtitle1">Bundle Program Name</Typography>
            <TextField
              fullWidth
              placeholder="Enter bundle program name"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DriveFileRenameOutlineIcon />
                  </InputAdornment>
                ),
              }}
            />
          </BorderSection>

          <BorderSection>
            <Typography variant="subtitle1">Program List</Typography>
            <Droppable droppableId="program-list" isDropDisabled={true}>
              {(provided) => (
                <Box
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  display="flex"
                  flexDirection="row"
                  alignItems="center"
                  gap={1}
                  mt={2}
                >
                  {programs?.map((program: any) => (
                    <Draggable
                      key={program.id}
                      draggableId={program.id}
                      index={0}
                    >
                      {(provided) => (
                        <SmallProgramCard
                          provided={provided}
                          key={program.id}
                          program={program}
                          programs={programs}
                        />
                      )}
                    </Draggable>
                  ))}
                </Box>
              )}

            </Droppable>

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" my={2}>Schedule Programs</Typography>
              <Button variant="outlined" color="primary" startIcon={<AddIcon />}>
                Add Day
              </Button>
            </Box>

            <Droppable droppableId="day-schedule-list">
              {(provided) => (
                <Box
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  display="flex"
                  flexDirection="row"
                  alignItems="center"
                  gap={1}
                  mt={2}
                >
                  {daySchedules.map((daySchedule, index: any) => (
                    <Box display="flex" flexDirection="column" gap={1}>
                      <Typography variant="subtitle1">Day {index + 1}</Typography>
                      <Box display="flex" flexDirection="row" gap={1}>
                        {daySchedule.programs.map((program: any) => (
                          <SmallProgramCard
                            provided={provided}
                            key={program.id}
                            programs={programs}
                            program={program}
                          />
                        ))}
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Droppable>
          </BorderSection>
        </Box>
      </DragDropContext>
    </Sidebar>
  );
}
