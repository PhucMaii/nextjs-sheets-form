import { IRoutes } from '@/app/utils/type';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React, { forwardRef } from 'react';
import './print.css';

interface PropTypes {
  manifest: any;
  routes: IRoutes[];
  currentDate: string;
}

// eslint-disable-next-line react/display-name
export const SummaryManifest = forwardRef(
  ({ manifest, currentDate }: PropTypes, ref: any) => {
    if (!manifest || Object.keys(manifest).length === 0) {
      // return;
      return (
        <div ref={ref}>
          <Box sx={{ width: '100%', height: '100%', mr: 4 }}>
            <Typography variant="h4">No Orders Available</Typography>
          </Box>
        </div>
      );
    }

    return (
      <div ref={ref}>
        <Box sx={{ width: '100%', height: '100%', marginRight: 10 }}>
          {Object.keys(manifest).length > 0 &&
            Object.keys(manifest).map((routeId: string, index: number) => {
              // const targetRoute = routes.find(
              //   (route: IRoutes) => route.id === Number(routeId),
              // );

              // if (!targetRoute) {
              //   return null;
              // }

              // if (!manifest[routeId]) {
              //   return null;
              // }

              const sortedItems = manifest[routeId]?.itemNames || [];

              return (
                <>
                  <Typography variant="h4" textAlign="center" m={2}>
                    {manifest[routeId]?.route?.name}
                  </Typography>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    m={2}
                  >
                    <Typography variant="h5" m={2}>
                      Driver:{' '}
                      {manifest[routeId]?.route?.employee?.name || 'Unknown'}
                    </Typography>
                    <Typography>{currentDate}</Typography>
                  </Box>

                  {/* Summary Manifest Table */}
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell>Quantity</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedItems &&
                        sortedItems.map((item: string, index: number) => {
                          const quantity = manifest[routeId].summary[item];

                          if (quantity === 0) {
                            return null;
                          }
                          return (
                            <TableRow key={index}>
                              <TableCell>{item}</TableCell>
                              <TableCell>{quantity}</TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>

                  {/* Note Table */}
                  {manifest[routeId]?.notes?.length > 0 && (
                    <>
                      <Typography variant="h4" m={2}>
                        Note
                      </Typography>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Client</TableCell>
                            <TableCell>Note</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {manifest[routeId]?.notes?.length > 0 &&
                            manifest[routeId]?.notes.map(
                              (clientNote: any, index: number) => {
                                return (
                                  <TableRow key={index}>
                                    <TableCell>
                                      {clientNote.clientName} -{' '}
                                      {clientNote.clientId}
                                    </TableCell>
                                    <TableCell>{clientNote.note}</TableCell>
                                  </TableRow>
                                );
                              },
                            )}
                        </TableBody>
                      </Table>
                    </>
                  )}

                  {index < Object.keys(manifest).length - 1 && (
                    <div className="page-break"></div>
                  )}
                </>
              );
            })}
        </Box>
      </div>
    );
  },
);
