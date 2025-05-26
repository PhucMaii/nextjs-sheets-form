import { IScheduledShift } from '@/app/utils/type';
import { useSortable } from '@dnd-kit/sortable';
import { Box, IconButton, Typography } from '@mui/material';
import { blue } from '@mui/material/colors';
import { CopyIcon, GripVerticalIcon } from 'lucide-react';
import React from 'react';

interface IProps {
  shift: IScheduledShift;
  onCopyShift?: () => void;
  onOpenEditShift?: () => void;
}

export default function Shift({ shift, onCopyShift, onOpenEditShift }: IProps) {
  if (!shift) return null;

  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: `shift __ ${shift.id}`,
    data: { type: 'shift' },
  });

  const style = {
    transition: 'none',
    opacity: isDragging ? 0.5 : 1,
  };

  const formatTime = (time: string) => {
    if (!time) return '';

    return time.split(' ')[1].slice(0, 5);
  };

  return (
    <div>
      <Box
        style={style}
        display="flex"
        width="100%"
        ref={setNodeRef}
        {...attributes}
        flexDirection="column"
        // alignItems="center"
        justifyContent="center"
        gap={0.2}
        sx={{ backgroundColor: blue[50], py: 0.5, px: 0.5, borderRadius: 1 }}
        onClick={onOpenEditShift}
      >
        <Box display="flex" justifyContent="space-between" width="100%">
          <div>
            <Box display="flex" alignItems="center" flexWrap="wrap" gap={0.5}>
              <Typography variant="body2" fontWeight="bold">
                {formatTime(shift?.startedAt)}
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                -
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {formatTime(shift?.endedAt || '')}
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={0.5}>
              <Typography variant="body2" fontWeight="bold">
                {shift?.hours}h
              </Typography>
              <Typography variant="caption">• {shift?.role}</Typography>
            </Box>
          </div>

          <Box display="flex" alignItems="center" gap={1}>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onCopyShift?.();
              }}
            >
              <CopyIcon size={16} />
            </IconButton>

            <IconButton {...listeners}>
              <GripVerticalIcon size={16} />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </div>
  );
}
