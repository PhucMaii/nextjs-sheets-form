import {
  TableCell,
  Table,
  TableBody,
  TableRow,
  TableHead,
  TableContainer,
  Button,
  Box,
} from '@mui/material';
import React, { useMemo, useState } from 'react';
import Shift from './Shift';
import { grey } from '@mui/material/colors';
import { PlusIcon } from 'lucide-react';
import { Employee } from '@prisma/client';
import { IEmployee } from '@/app/utils/type';
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import ShiftContainer from './ShiftContainer';
import EditScheduledShift from '../Modals/edit/EditScheduledShift';
import { ShowNotificationType } from '@/hooks/useNotification';
import dayjs from 'dayjs';

interface IProps {
  employees: IEmployee[];
  selectedWeek: any;
  shifts: any[];
  setShifts: (shifts: any[]) => void;
  onOpenAddShift: (employee: Employee, date: string) => void;
  showNotification: ShowNotificationType;
  refresh: () => Promise<void>;
}

export default function ScheduledShiftTable({
  employees,
  selectedWeek,
  shifts,
  setShifts,
  onOpenAddShift,
  showNotification,
  refresh,
}: IProps) {
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [openEditShift, setOpenEditShift] = useState<any>({
    open: false,
    shift: null,
  });

  const sensors = useSensors(useSensor(PointerSensor));

  const daysInWeek = useMemo(() => {
    if (!selectedWeek) return [];

    const startDate = new Date(selectedWeek[0]);
    const endDate = new Date(selectedWeek[1]);
    const dates = [];

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      dates.push(d.toLocaleDateString('en-US', { dateStyle: 'full' }));
    }

    return dates;
  }, [selectedWeek]);

  const onCopyShift = (shift: any) => {
    const newShift = {
      ...shift,
      id: crypto.randomUUID(),
    };
    setShifts([...shifts, newShift]);
  };

  const findContainerOfShifts = (id: string, type: 'container' | 'shift') => {
    const targetDate = id.split(' __ ')[2];
    if (type === 'container') {
      return daysInWeek.find((day: string) => day === targetDate);
    }

    const shift = shifts.find(
      (shift: any) => shift.id == id.split(' __ ')[1],
    );
    return shift?.date;
  };

  const findShift = (id: string) => {
    return shifts.find((shift: any) => shift.id == id.split(' __ ')[1]);
  };

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const { id } = active;
    setActiveItemId(id.toString());
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeId = active.id.toString();
    const overId = over?.id?.toString();

    const activeType = active.data.current?.type;
    const overType = over?.data.current?.type;


    // Item Drop Into Void -> Remove Item
    if (active && !over) {
      const activeShift = findShift(activeId);
      const newShifts = shifts.filter(
        (shift: any) => shift.id !== activeShift.id,
      );
      setShifts(newShifts);
      return;
    }

    // Item Drop Into Container
    if (
      activeType === 'shift' &&
      overType === 'container' &&
      active &&
      over &&
      active.id !== over.id
    ) {
      const activeContainer = findContainerOfShifts(activeId, 'shift');
      const overContainer = findContainerOfShifts(overId || '', 'container');

      // If the active or over container is undefined, return
      if (!activeContainer || !overContainer) {
        return;
      }

      const activeShift = findShift(activeId);

      const newShifts = shifts.map((shift: any) => {
        if (shift.id === activeShift.id) {
          const startedAt = dayjs(`${overContainer} ${activeShift.startedAt.split(' ')[1]}`).format('YYYY-MM-DD HH:mm:ss');
          const endedAt = dayjs(`${overContainer} ${activeShift.endedAt.split(' ')[1]}`).format('YYYY-MM-DD HH:mm:ss');

          const hours = dayjs(endedAt).diff(startedAt, 'hours', true);
          const cost = hours * (activeShift.employee.hourlyRate || 0);

          return {
            ...shift,
            date: overContainer,
            startedAt: startedAt,
            endedAt: endedAt,
            hours: Math.round(hours * 100) / 100,
            cost: cost,
            queryDate: dayjs(startedAt).format('MM/DD/YYYY'),
          };
        }
        return shift;
      });

      setShifts(newShifts);
    }
  };

  return (
    <>
    <EditScheduledShift
      open={openEditShift.open}
      onClose={() => setOpenEditShift(false)}
      shift={openEditShift.shift}
      showNotification={showNotification}
      refresh={refresh}
    />
    
    <TableContainer>
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        collisionDetection={closestCorners}
      >
        <SortableContext items={shifts.map((shift: any) => shift.id)}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ borderRight: `1px solid ${grey[200]}` }}>
                  Employees
                </TableCell>
                {daysInWeek.map((day: string) => (
                  <TableCell
                    align="center"
                    key={day}
                    sx={{ borderRight: `1px solid ${grey[200]}` }}
                  >
                    {day}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((employee: any) => (
                <TableRow key={employee.id}>
                  <TableCell sx={{ borderRight: `1px solid ${grey[200]}` }}>
                    {employee.name}
                  </TableCell>
                  {daysInWeek.map((day: string, index: number) => {
                    const employeeShifts = shifts.filter(
                      (shift: any) =>
                        shift.date === day && shift.employeeId === employee.id,
                    ).sort((a: any, b: any) => dayjs(a.startedAt).diff(dayjs(b.startedAt)));

                    if (!employeeShifts || employeeShifts.length === 0) {
                      return (
                        <TableCell
                          align="center"
                          key={`${employee.id}-${day}-${index}`}
                          sx={{ borderRight: `1px solid ${grey[50]}` }}
                        >
                          <ShiftContainer employee={employee} date={day}>
                            <Button
                              onClick={() => onOpenAddShift(employee, day)}
                              sx={{
                                backgroundColor: grey[50],
                                width: '100%',
                                height: '100%',
                                color: grey[600],
                              }}
                            >
                              <PlusIcon />
                            </Button>
                          </ShiftContainer>
                        </TableCell>
                      );
                    }

                    return (
                      <TableCell
                        // align="center"
                        key={`${employee.id}-${day}-${index}`}
                        sx={{
                          borderRight: `1px solid ${grey[200]}`,
                          p: 1,
                          verticalAlign: 'top',
                        }}
                      >
                        <ShiftContainer employee={employee} date={day}>
                          <SortableContext
                            items={employeeShifts.map((shift: any) => shift.id)}
                          >
                            <Box
                              display="flex"
                              flexDirection="column"
                              gap={1}
                              height="100%"
                              // justifyContent="center"
                            >
                              {employeeShifts?.map((shift: any) => (
                                <Shift
                                  key={shift.id}
                                  shift={shift}
                                  onCopyShift={() => onCopyShift(shift)}
                                  onOpenEditShift={() => setOpenEditShift({
                                    open: true,
                                    shift: shift,
                                  })}
                                />
                              ))}
                              <Box
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                height="100%"
                              >
                                <Button
                                  onClick={() => onOpenAddShift(employee, day)}
                                  sx={{
                                    // backgroundColor: grey[50],
                                    width: '100%',
                                    height: '100%',
                                    color: grey[600],
                                  }}
                                >
                                  <PlusIcon />
                                </Button>
                              </Box>
                            </Box>
                          </SortableContext>
                        </ShiftContainer>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SortableContext>

        <DragOverlay>
          {activeItemId ? (
            <Shift shift={findShift(activeItemId)} onCopyShift={() => {}} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </TableContainer>
    </>
  );
}
