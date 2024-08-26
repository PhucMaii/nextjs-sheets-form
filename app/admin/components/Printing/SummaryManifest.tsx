import { mainItems } from '@/app/lib/constant';
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

export const SummaryManifest = forwardRef(
  ({ manifest, routes, currentDate }: PropTypes, ref: any) => {
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

    // Display the beansprouts first then other items
    const customSortKeys = (keys: string[]): any => {
      const mainKeys = keys.filter((key) => mainItems.includes(key));
      const otherKeys = keys.filter((key) => !mainItems.includes(key));
      return [...mainKeys, ...otherKeys];
    };

    return (
      <div ref={ref}>
        <Box sx={{ width: '100%', height: '100%', marginRight: 10 }}>
          {Object.keys(manifest).length > 0 &&
            Object.keys(manifest).map((routeId: string, index: number) => {
              const targetRoute = routes.find(
                (route: IRoutes) => route.id === Number(routeId),
              );

              if (!targetRoute) {
                return null;
              }

              const sortedItems: any = customSortKeys(
                Object.keys(manifest[routeId].summary),
              );

              return (
                <>
                  <Typography variant="h4" textAlign="center" m={2}>
                    {targetRoute.name}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center" m={2}>
                    <Typography variant="h5" m={2}>
                      Driver: {targetRoute.driver?.name}
                    </Typography>
                    <Typography>{currentDate}</Typography>
                  </Box>

                  {/* Manifest Table */}
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
