import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@mui/material';
import { Action } from '@prisma/client';
import React, { Fragment } from 'react';
import { TableComponents, TableVirtuoso } from 'react-virtuoso';

interface IProps {
  actionData: any[];
}

export default function TrackInventoryRecordTable({ actionData }: IProps) {
    const fixedHeaderContent = () => {
        return (
            <TableRow>
                <TableCell sx={{ width: 50 }}>Id</TableCell>
                <TableCell sx={{ width: 100 }}>Date</TableCell>
                <TableCell sx={{ width: 200 }}>Description</TableCell>
                <TableCell sx={{ width: 100 }}>Created at</TableCell>
                <TableCell sx={{ width: 100 }}>Type</TableCell>
            </TableRow>
        )
    }

    const rowContent = (index: number, action: Action) => {
        return (
            <Fragment key={index}>
                <TableCell sx={{ width: 50 }}>{action.id}</TableCell>
                <TableCell>{action.date}</TableCell>
                <TableCell>{action.description}</TableCell>
                <TableCell>{action.createdAt}</TableCell>
                <TableCell>{action.name}</TableCell>
            </Fragment>
        )
    }

    const VirtuosoTableComponents: TableComponents<any> = {
        Table: (props) => (
            <Table 
                {...props}
                sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }}
            />
        ),

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        TableRow: ({ item, ...props }) => {
            return (
                <TableRow {...props}/>
            )
        },

        TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
            <TableBody ref={ref} {...props} />
        ))
    }

  return (
    <Paper        
        style={{
            height: 500,
            width: 790,
            overflow: 'scroll',
        }}
    >
      {/* <Table>
        <TableHead>
          <TableRow>
            <TableCell>Id</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Type</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {actionData?.map((action: Action, index: number) => {
            return (
              <TableRow key={index}>
                <TableCell>{action.id}</TableCell>
                <TableCell>{action.date}</TableCell>
                <TableCell>{action.description}</TableCell>
                <TableCell>{action.name}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table> */}
      <TableVirtuoso 
        data={actionData}
        components={VirtuosoTableComponents}
        fixedHeaderContent={fixedHeaderContent}
        itemContent={rowContent}
      />
    </Paper>
  );
}
