import { formatTime } from '@/app/utils/number';
import { IScheduledShift } from '@/app/utils/type';
import { useSortable } from '@dnd-kit/sortable';
import { Box, IconButton, Typography, Chip } from '@mui/material';
import { blue, green, orange, red, purple } from '@mui/material/colors';
import {
  CopyIcon,
  GripVerticalIcon,
  UserIcon,
  FactoryIcon,
  AlertTriangleIcon,
  XIcon,
} from 'lucide-react';
import React from 'react';

// Types and Interfaces
interface ShiftProps {
  shift: IScheduledShift;
  onCopyShift?: () => void;
  onOpenEditShift?: () => void;
}

interface RoleColors {
  background: string;
  border: string;
  text: string;
  icon: string;
  accent: string;
}

interface ShiftStatus {
  isOff: boolean;
  isSkip: boolean;
}

// Utility Functions
const getRoleColors = (role: string): RoleColors => {
  const roleLower = role?.toLowerCase() || '';

  // Driver/Delivery roles - Blue theme
  if (roleLower.includes('driver') || roleLower.includes('delivery')) {
    return {
      background: `linear-gradient(135deg, ${blue[50]} 0%, ${blue[100]} 100%)`,
      border: blue[200],
      text: 'black',
      icon: blue[600],
      accent: blue[400],
    };
  }

  // Factory/Production/Warehouse roles - Green theme
  if (
    roleLower.includes('factory') ||
    roleLower.includes('production') ||
    roleLower.includes('warehouse')
  ) {
    return {
      background: `linear-gradient(135deg, ${green[50]} 0%, ${green[100]} 100%)`,
      border: green[200],
      text: 'black',
      icon: green[600],
      accent: green[400],
    };
  }

  // Admin/Manager roles - Purple theme
  if (roleLower.includes('admin') || roleLower.includes('manager')) {
    return {
      background: `linear-gradient(135deg, ${purple[50]} 0%, ${purple[100]} 100%)`,
      border: purple[200],
      text: 'black',
      icon: purple[600],
      accent: purple[400],
    };
  }

  // Default/Other roles - Orange theme
  return {
    background: `linear-gradient(135deg, ${orange[50]} 0%, ${orange[100]} 100%)`,
    border: orange[200],
    text: 'black',
    icon: orange[600],
    accent: orange[400],
  };
};

const getRoleIcon = (role: string): React.ReactElement => {
  const roleLower = role?.toLowerCase() || '';

  if (roleLower.includes('driver') || roleLower.includes('delivery')) {
    return <UserIcon size={14} />;
  }

  if (
    roleLower.includes('factory') ||
    roleLower.includes('production') ||
    roleLower.includes('warehouse')
  ) {
    return <FactoryIcon size={14} />;
  }

  return <UserIcon size={14} />;
};

const getShiftStatus = (shift: IScheduledShift): ShiftStatus => ({
  isOff: shift?.isOff || false,
  isSkip: shift?.isSkip || false,
});

// Sub-components
const StatusChips: React.FC<{ status: ShiftStatus }> = ({ status }) => {
  if (!status.isOff && !status.isSkip) return null;

  return (
    <Box display="flex" gap={0.5} p={0.5}>
      {status.isOff && (
        <Chip
          icon={<XIcon size={12} />}
          label="Off"
          size="small"
          sx={{
            backgroundColor: red[500],
            color: 'white',
            fontSize: '0.7rem',
            height: 20,
            '& .MuiChip-icon': {
              color: 'white',
            },
          }}
        />
      )}
      {status.isSkip && (
        <Chip
          icon={<AlertTriangleIcon size={12} />}
          label="Skip"
          size="small"
          sx={{
            backgroundColor: orange[500],
            color: 'white',
            fontSize: '0.6rem',
            height: 20,
            '& .MuiChip-icon': {
              color: 'white',
            },
          }}
        />
      )}
    </Box>
  );
};

const TimeDisplay: React.FC<{
  shift: IScheduledShift;
  colors: RoleColors;
  status: ShiftStatus;
}> = ({ shift, colors, status }) => (
  <Box display="flex" alignItems="center" gap={1}>
    <Box
      display="flex"
      alignItems="center"
      gap={0.5}
      sx={{
        backgroundColor: status.isOff ? red[200] : colors.accent + '20',
        px: 1,
        py: 0.5,
        borderRadius: 1,
      }}
    >
      <Typography
        variant="body2"
        fontWeight="bold"
        color={status.isOff ? red[800] : colors.text}
        sx={{ fontSize: '0.75rem' }}
      >
        {formatTime(shift?.startedAt)}
      </Typography>
      <Typography
        variant="body2"
        fontWeight="bold"
        color={status.isOff ? red[600] : colors.text}
        sx={{ fontSize: '0.75rem' }}
      >
        -
      </Typography>
      <Typography
        variant="body2"
        fontWeight="bold"
        color={status.isOff ? red[800] : colors.text}
        sx={{ fontSize: '0.75rem' }}
      >
        {formatTime(shift?.endedAt || '')}
      </Typography>
    </Box>
  </Box>
);

const RoleAndHours: React.FC<{
  shift: IScheduledShift;
  colors: RoleColors;
  status: ShiftStatus;
}> = ({ shift, colors, status }) => (
  <Box display="flex" alignItems="center" gap={0.5}>
    <Box display="flex" alignItems="center" gap={0.5}>
      <Box
        sx={{
          color: status.isOff ? red[600] : colors.icon,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {getRoleIcon(shift?.role || '')}
      </Box>
      <Typography
        variant="caption"
        fontWeight="medium"
        color={status.isOff ? red[700] : colors.text}
        sx={{ fontSize: '0.7rem' }}
      >
        {shift?.role}
      </Typography>
    </Box>

    <Box
      sx={{
        backgroundColor: status.isOff ? red[100] : colors.accent + '30',
        px: 0.8,
        py: 0.2,
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography
        variant="caption"
        fontWeight="bold"
        color={status.isOff ? red[800] : colors.text}
        sx={{ fontSize: '0.7rem' }}
      >
        {shift?.hours}h
      </Typography>
    </Box>
    <StatusChips status={status} />
  </Box>
);

const ActionButtons: React.FC<{
  colors: RoleColors;
  status: ShiftStatus;
  onCopyShift?: () => void;
  listeners: any;
}> = ({ colors, status, onCopyShift, listeners }) => (
  <Box display="flex" alignItems="center" gap={0.5}>
    <IconButton
      size="small"
      onClick={(e) => {
        e.stopPropagation();
        onCopyShift?.();
      }}
      sx={{
        color: status.isOff ? red[600] : colors.icon,
        '&:hover': {
          backgroundColor: status.isOff ? red[100] : colors.accent + '20',
        },
      }}
    >
      <CopyIcon size={14} />
    </IconButton>

    <IconButton
      size="small"
      {...listeners}
      sx={{
        color: status.isOff ? red[600] : colors.icon,
        '&:hover': {
          backgroundColor: status.isOff ? red[100] : colors.accent + '20',
        },
      }}
    >
      <GripVerticalIcon size={14} />
    </IconButton>
  </Box>
);

// Main Component
export default function Shift({
  shift,
  onCopyShift,
  onOpenEditShift,
}: ShiftProps) {
  // Early return for invalid shift
  if (!shift) return null;

  // Drag and drop setup
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: `shift __ ${shift.id}`,
    data: { type: 'shift' },
  });

  // Component state and computed values
  const colors = getRoleColors(shift?.role || '');
  const status = getShiftStatus(shift);

  const dragStyle = {
    transition: 'none',
    opacity: isDragging ? 0.5 : 1,
  };

  // Dynamic styles based on status
  const containerStyles = {
    background: status.isOff
      ? `linear-gradient(135deg, ${red[50]} 0%, ${red[100]} 100%)`
      : colors.background,
    border: `2px solid ${status.isOff ? red[300] : colors.border}`,
    py: 1,
    px: 1.5,
    borderRadius: 2,
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: `0 4px 12px ${status.isOff ? red[200] : colors.accent}40`,
      borderColor: status.isOff ? red[400] : colors.accent,
    },
    position: 'relative' as const,
    overflow: 'hidden' as const,
  };

  return (
    <div>
      <Box
        style={dragStyle}
        display="flex"
        width="100%"
        ref={setNodeRef}
        {...attributes}
        flexDirection="column"
        justifyContent="center"
        gap={1}
        sx={containerStyles}
        onClick={onOpenEditShift}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          width="100%"
          alignItems="flex-start"
        >
          <Box display="flex" flexDirection="column" gap={0.5} flex={1}>
            <TimeDisplay shift={shift} colors={colors} status={status} />
            <RoleAndHours shift={shift} colors={colors} status={status} />
          </Box>

          <ActionButtons
            colors={colors}
            status={status}
            onCopyShift={onCopyShift}
            listeners={listeners}
          />
        </Box>
      </Box>
    </div>
  );
}
