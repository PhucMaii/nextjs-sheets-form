import React, { Dispatch, SetStateAction } from 'react';
import { Paper, Typography, Box, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { CreateProgramForm } from '../../../farm/program/create/page';
import { Add as AddIcon } from '@mui/icons-material';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import ZoneProgramCard from './ZoneProgramCard';
import { ZoneProgram } from '../types';

interface ZoneProgramsProps {
  formData: CreateProgramForm;
  setFormData: Dispatch<SetStateAction<CreateProgramForm>>;
  availableZones: any;
  isLoadingZones: boolean;
}

export default function ZonePrograms({
  formData,
  setFormData,
  availableZones,
  isLoadingZones,
}: ZoneProgramsProps) {
  const theme = useTheme();

  const addZoneProgram = () => {
    const newZoneProgram: ZoneProgram = {
      id: crypto.randomUUID(),
      zoneId: availableZones[0].relay_id,
      duration: 30, // Default 30 seconds
      index: formData.zonePrograms.length + 1,
    };
    setFormData((prev) => ({
      ...prev,
      zonePrograms: [...prev.zonePrograms, newZoneProgram],
    }));
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(formData.zonePrograms);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFormData((prev) => ({
      ...prev,
      zonePrograms: items,
    }));
  };

  return (
    <Paper
      sx={{
        p: 3,
        boxShadow: 'none',
        border: `1px solid ${theme.palette.grey[300]}`,
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h6" fontWeight={600}>
          Zone Programs
        </Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={addZoneProgram}
          disabled={isLoadingZones}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
          }}
        >
          Add Zone
        </Button>
      </Box>

      {formData.zonePrograms.length === 0 || isLoadingZones ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          py={6}
          sx={{
            border: `2px dashed ${theme.palette.grey[300]}`,
            borderRadius: 2,
            backgroundColor: theme.palette.grey[50],
          }}
        >
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            gutterBottom
          >
            No zones added yet
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Click &quot;Add Zone&quot; to start building your program
          </Typography>
        </Box>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="zone-programs">
            {(provided: any) => (
              <Box {...provided.droppableProps} ref={provided.innerRef}>
                {formData.zonePrograms.map((zoneProgram, index) => (
                  <ZoneProgramCard
                    key={zoneProgram.id}
                    zoneProgram={zoneProgram}
                    index={index}
                    availableZones={availableZones}
                    setFormData={setFormData}
                    formData={formData}
                  />
                ))}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </Paper>
  );
}
