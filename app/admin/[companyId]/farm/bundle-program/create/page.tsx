'use client';
import { Box, InputAdornment, TextField, Typography } from '@mui/material';
import React from 'react';
import { BorderSection, ShadowSection } from '../../../reports/styled';
import Sidebar from '../../../components/Sidebar/Sidebar';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import { useParams } from 'next/navigation';
import ProgramCard from '../../../components/Farm/ProgramCard';
import SmallProgramCard from '../../../components/Farm/SmallProgramCard';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from '@hello-pangea/dnd';
import { usePrograms } from '@/hooks/db-tables/usePrograms';

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

  const { getProgramColor } = usePrograms(companyId, programs || []);

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
            <Droppable droppableId="program-list">
              {(provided) => (
                <Box
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  display="flex"
                  flexDirection="column"
                  gap={1}
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
                          getProgramColor={getProgramColor}
                        />
                      )}
                    </Draggable>
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
