import { alpha } from '@mui/material/styles';
import { Avatar, Box, Paper, Stack, Typography } from '@mui/material';
import React from 'react';
import { Program } from './types';
import { Water as WaterIcon } from '@mui/icons-material';
import { getProgramColor } from '@/app/utils/programs';

interface IProps {
    provided: any;
    program: Program;
    programs: Program[];
}

export default function SmallProgramCard({
    provided,
    program,
    programs
}: IProps) {
    
  return (
    <Paper
      ref={provided.innerRef}
      {...provided.dragHandleProps}
      {...provided.draggableProps}
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: `2px solid ${alpha(getProgramColor(program.id, programs), 0.3)}`,
        backgroundColor: alpha(getProgramColor(program.id, programs), 0.1),
        minWidth: 220,
        cursor: 'grab',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 4px 12px ${alpha(getProgramColor(program.id, programs), 0.3)}`,
          borderColor: getProgramColor(program.id, programs),
          backgroundColor: alpha(getProgramColor(program.id, programs), 0.15),
        },
        '&:active': {
          cursor: 'grabbing',
          transform: 'translateY(0px)',
        },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <Avatar
          sx={{
            backgroundColor: alpha(getProgramColor(program.id, programs), 0.2),
            color: getProgramColor(program.id, programs),
            border: `2px solid ${alpha(getProgramColor(program.id, programs), 0.3)}`,
          }}
        >
          <WaterIcon />
        </Avatar>
        <Box flex={1}>
          <Typography
            variant="body1"
            fontWeight={600}
            color={getProgramColor(program.id, programs)}
          >
            {program.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {program.zoneWaterPrograms.length} zones
          </Typography>
        </Box>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: getProgramColor(program.id, programs),
            opacity: 0.6,
          }}
        />
      </Stack>
    </Paper>
  );
}
