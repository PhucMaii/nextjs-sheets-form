import React, { useState } from 'react';
import { Box, Typography, IconButton, useTheme, Stack } from '@mui/material';
import { alpha } from '@mui/material';
import { DragIndicator as DragHandleIcon } from '@mui/icons-material';
import { Trash2Icon } from 'lucide-react';
import { Program } from '../types';
import { useParams } from 'next/navigation';
import { useProgramSchedules } from '@/hooks/db-tables/useProgramSchedules';
import { ProgramSchedule } from '@prisma/client';
import TimeInputModal from '../../Modals/edit/SingleFieldUpdate';
import ConfirmModal from '../../Modals/ConfirmModal';
import { times } from '@/app/lib/constant';
import { ShowNotificationType } from '@/hooks/useNotification';
import { getProgramColor, getProgramColorByZoneWaterPrograms, primaryProgramColor } from '@/app/utils/programs';

interface IProps {
  provided: any;
  snapshot: any;
  schedule: ProgramSchedule;
  program: Program | any;
  showNotification: ShowNotificationType;
  refetchSchedules: () => void;
  isDetailed?: boolean;
  removeSchedule: (id: string) => void;
  handleSave: () => Promise<void>;
  setSchedules: any
}

function ScheduleCard({
  provided,
  snapshot,
  schedule,
  program,
  showNotification,
  refetchSchedules,
  isDetailed = false,
  removeSchedule,
  handleSave,
  setSchedules,
}: IProps) {
  const { companyId }: any = useParams();
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState<{
    open: boolean;
    targetId: string | null;
  }>({
    open: false,
    targetId: null,
  });

  const [isTimeInputModalOpen, setIsTimeInputModalOpen] = useState<{
    open: boolean;
    targetId: string | null;
    defaultValue: string | null;
  }>({
    open: false,
    targetId: null,
    defaultValue: null,
  });

  const { deleteProgramSchedule, updateProgramScheduleTime } =
    useProgramSchedules(companyId);
  const theme = useTheme();

  const handleDeleteSchedule = async (id: string) => {
    try {
      if (isNaN(Number(id))) {
        removeSchedule(id);
        return;
      }
      
      await handleSave();
      const response = await deleteProgramSchedule(id);

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      refetchSchedules();
      showNotification('success', response.data.message);
      removeSchedule(id);
    } catch (error: any) {
      console.log('Fail to delete schedule: ', error);
    }
  };

  const handleUpdateTime = async (id: string, time: string) => {
    try {
      if (isNaN(Number(id))) {
        setSchedules((prev: any[]) =>
          prev.map((schedule: any) =>
            schedule.id === id ? { ...schedule, time: time } : schedule,
          ),
        );
        return;
      }
      await handleSave();
      const response = await updateProgramScheduleTime(id, time);

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      refetchSchedules();
      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('Fail to update time: ', error);
    }
  };

  return (
    <>
      <TimeInputModal
        open={isTimeInputModalOpen.open}
        onClose={() =>
          setIsTimeInputModalOpen({
            open: false,
            targetId: null,
            defaultValue: null,
          })
        }
        updatedField={isTimeInputModalOpen.targetId || ''}
        title="Edit Time"
        label="Time"
        menuList={times}
        renderField={'time'}
        defaultValue={isTimeInputModalOpen.defaultValue || schedule.time}
        handleUpdate={handleUpdateTime as any}
      />
      <ConfirmModal
        open={isOpenConfirmModal.open}
        onClose={() => setIsOpenConfirmModal({ open: false, targetId: null })}
        handleSubmit={() =>
          handleDeleteSchedule(isOpenConfirmModal.targetId || '')
        }
        title="Are you sure to delete this schedule?"
        buttonLabel="Delete"
        showNotification={showNotification}
        color="error"
      />
      <Box
        ref={provided.innerRef}
        onClick={() =>
          setIsTimeInputModalOpen({
            open: true,
            targetId: schedule.id.toString(),
            defaultValue: schedule.time,
          })
        }
        {...provided.draggableProps}
        sx={{
          p: 0.5,
          borderRadius: 0.5,
          backgroundColor: alpha(primaryProgramColor, 0.2),
          border: `1px solid ${alpha(primaryProgramColor, 0.4)}`,
          borderLeft: `3px solid ${primaryProgramColor}`,
          opacity: snapshot.isDragging ? 0.5 : 1,
          cursor: 'grab',
          '&:active': {
            cursor: 'grabbing',
          },
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: alpha(primaryProgramColor, 0.3),
          },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minWidth: isDetailed ? 300 : 'auto',
        }}
      >
        <Box
          display="flex"
          flexDirection={isDetailed ? 'column-reverse' : 'column'}
          gap={isDetailed ? 1 : 0.5}
        >
          <Box display="flex" alignItems="center" gap={0.5}>
            <Typography
              variant={isDetailed ? 'subtitle1' : 'caption'}
              sx={{
                fontSize: isDetailed ? '0.8rem' : '0.7rem',
                fontWeight: 600,
                color: isDetailed ? theme.palette.text.primary : primaryProgramColor,
                display: 'block',
                lineHeight: 1.2,
              }}
            >
              {schedule.time}
            </Typography>
            {isDetailed && (
              <Stack direction="row" alignItems="center" gap={0.5}>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.8rem',
                  }}
                >
                  • {program.duration} sec
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.8rem',
                  }}
                >
                  ({program.zoneWaterPrograms.length} zones)
                </Typography>
              </Stack>
            )}
          </Box>
          <Typography
            variant={isDetailed ? 'subtitle1' : 'caption'}
            sx={{
              fontSize: isDetailed ? '0.9rem' : '0.7rem',
              color: primaryProgramColor,
              display: 'block',
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {program?.name || program?.waterProgram?.name}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            {...provided.dragHandleProps}
            sx={{
              cursor: 'grab',
              display: 'flex',
              alignItems: 'center',
              '&:active': { cursor: 'grabbing' },
            }}
          >
            <DragHandleIcon color="action" />
          </Box>
          <IconButton
            onClick={(e: any) => {
              e.stopPropagation();
              e.preventDefault();
              setIsOpenConfirmModal({
                open: true,
                targetId: schedule.id.toString(),
              });
            }}
          >
            <Trash2Icon size={16} color={theme.palette.error.main} />
          </IconButton>
        </Box>
      </Box>
    </>
  );
}

export default ScheduleCard;
