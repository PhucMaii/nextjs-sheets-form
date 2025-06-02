import { IEmployee } from '@/app/utils/type';
import { useSortable } from '@dnd-kit/sortable';
import { Box } from '@mui/material'
import React from 'react';

interface IProps {
    employee: IEmployee;
    date: string;
    children: React.ReactNode;
}

export default function ShiftContainer({employee, date, children}: IProps) {
    const { setNodeRef, isDragging } = useSortable({
        id: `container __ ${employee.id} __ ${date}`,
        data: { type: 'container' },
      });

      const style = {
        transition: 'none',
        opacity: isDragging ? 0.5 : 1,
      };
      
  return (
    <Box
      ref={setNodeRef}
    //   {...attributes}
    //   {...listeners}
      style={style}
    >
        {children}
    </Box>
  )
}