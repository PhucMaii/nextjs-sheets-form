import React, { useMemo, useState, useEffect } from 'react';
import { Paper, Stack, Typography, Avatar, Box, Chip } from '@mui/material';
import { theme } from '@/theme';
import { alpha } from '@mui/material/styles';
import { Schedule as ScheduleIcon } from '@mui/icons-material';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { Program, ZoneWater } from '../types';
import SmallProgramCard from '../SmallProgramCard';
import { ShowNotificationType } from '@/hooks/useNotification';
import ZoneFilter from '../ZoneFilter';
import { useParams } from 'next/navigation';
import { useHydrawiseAPI } from '@/hooks/useHydrawiseAPI';

interface ProgramsSectionProps {
	programs: Program[];
	showNotification: ShowNotificationType;
}

export default function ProgramsSection({
	programs,
	showNotification,
}: ProgramsSectionProps) {
	const { companyId }: any = useParams();
	const { zones } = useHydrawiseAPI(companyId);
	const [selectedZones, setSelectedZones] = useState<number[]>([]);
	const [displayedPrograms, setDisplayedPrograms] = useState<Program[]>(
		programs || [],
	);

	// Extract unique zones from all programs
	const availableZones = useMemo(() => {
		if (!programs) return [];
		const zoneMap = new Map<number, { zoneId: number; name: string }>();

		programs.forEach((program: Program) => {
			program.zoneWaterPrograms?.forEach((zoneWater: ZoneWater) => {
				const zoneId = Number(zoneWater.zoneProgram?.zoneId);
				if (zoneId && !zoneMap.has(zoneId)) {
					zoneMap.set(zoneId, {
						zoneId,
						name: `Zone ${zoneId}`,
					});
				}
			});
		});

		return Array.from(zoneMap.values()).sort((a, b) => a.zoneId - b.zoneId);
	}, [programs]);

	// Filter programs based on selected zones
	useEffect(() => {
		if (!programs) return;

		if (selectedZones.length === 0) {
			setDisplayedPrograms(programs);
			return;
		}

		const filtered = programs.filter((program: Program) => {
			const programZoneIds =
				program.zoneWaterPrograms?.map((zoneWater: ZoneWater) =>
					Number(zoneWater.zoneProgram?.zoneId),
				) || [];

			// Check if program has at least one zone that matches selected zones
			return programZoneIds.some((zoneId) => selectedZones.includes(zoneId));
		});

		setDisplayedPrograms(filtered);
	}, [programs, selectedZones]);
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.grey[200], 0.5)}`,
        // background: `linear-gradient(135deg, ${alpha(theme.palette.grey[50], 0.5)}, ${alpha(theme.palette.grey[100], 0.2)})`,
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              backgroundColor: alpha(theme.palette.info.main, 0.1),
              color: theme.palette.info.main,
            }}
          >
            <ScheduleIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Available Programs
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Drag programs to schedule them for specific days
            </Typography>
          </Box>
          <Chip
            label="Drag to schedule"
            size="small"
            sx={{
              backgroundColor: alpha(theme.palette.info.main, 0.1),
              color: theme.palette.info.main,
              fontWeight: 500,
            }}
          />
        </Stack>

        {/* Zone Filter Section */}
        <ZoneFilter
          availableZones={availableZones}
          selectedZones={selectedZones}
          onZoneChange={setSelectedZones}
          zones={zones}
        />

        <Droppable droppableId="program-list" isDropDisabled={true}>
          {(provided) => (
            <Box
              {...provided.droppableProps}
              ref={provided.innerRef}
              sx={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 2,
                minHeight: 120,
                p: 2,
                borderRadius: 2,
                border: `2px dashed ${alpha(theme.palette.grey[300], 0.5)}`,
                backgroundColor: alpha(theme.palette.grey[50], 0.3),
              }}
            >
              {displayedPrograms?.map((program: Program, index: number) => (
                <Draggable
                  key={program.id}
                  draggableId={'program-' + program.id}
                  index={index}
                >
                  {(provided) => (
                    <SmallProgramCard
                      provided={provided}
                      key={program.id}
                      program={program}
                      showNotification={showNotification}
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </Stack>
    </Paper>
  );
}
