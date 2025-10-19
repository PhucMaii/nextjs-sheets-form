import { alpha } from '@mui/material/styles';
import {
  Avatar,
  Box,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { Program } from './types';
import { Water as WaterIcon } from '@mui/icons-material';
import { primaryProgramColor } from '@/app/utils/programs';
import { Trash2Icon } from 'lucide-react';
import ConfirmModal from '../Modals/ConfirmModal';
import { ShowNotificationType } from '@/hooks/useNotification';

interface IProps {
  provided: any;
  program: Program;
  isSmall?: boolean;
  onClick?: () => void;
  handleDelete?: (id: string) => void;
  showNotification: ShowNotificationType;
}

export default function SmallProgramCard({
  provided,
  program,
  isSmall = false,
  handleDelete,
  onClick,
  showNotification,
}: IProps) {
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState<boolean>(false);
  return (
    <>
    {handleDelete && <ConfirmModal 
      open={isOpenConfirmModal}
      onClose={() => setIsOpenConfirmModal(false)}
      title="Are you sure to delete this program?"
      handleSubmit={() => handleDelete?.(program.id.toString())}
      showNotification={showNotification}
      color="error"
    />}
    <Paper
      ref={provided.innerRef}
      {...provided.dragHandleProps}
      {...provided.draggableProps}
      elevation={0}
      onClick={onClick}
      sx={{
        p: 2,
        borderRadius: 2,
        border: `2px solid ${alpha(primaryProgramColor, 0.3)}`,
        backgroundColor: alpha(primaryProgramColor, 0.1),
        minWidth: isSmall ? 150 : 220,
        cursor: 'grab',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 4px 12px ${alpha(primaryProgramColor, 0.3)}`,
          borderColor: primaryProgramColor,
          backgroundColor: alpha(primaryProgramColor, 0.15),
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
            backgroundColor: alpha(primaryProgramColor, 0.2),
            color: primaryProgramColor,
            border: `2px solid ${alpha(primaryProgramColor, 0.3)}`,
          }}
        >
          <WaterIcon />
        </Avatar>
        <Box flex={1}>
          <Typography
            variant="body1"
            fontWeight={600}
            color={primaryProgramColor}
          >
            {program.name}
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            {program.time && (
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
              >
                {program.time} •
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              {program?.zoneWaterPrograms?.length} zones
            </Typography>
          </Box>
        </Box>
        {handleDelete && (
          <Box>
            <IconButton color="error" onClick={(e) => {
              e.stopPropagation();
              setIsOpenConfirmModal(true);
            }}>
              <Trash2Icon size={16} />
            </IconButton>
          </Box>
        )}
      </Stack>
    </Paper>
    </>

  );
}
