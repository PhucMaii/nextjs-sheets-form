import { IRoutes } from '@/app/utils/type';
import {
  Table,
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
}

export const ManifestPrint = forwardRef(
  ({ manifest, routes }: PropTypes, ref: any) => {

    // Display the beansprouts first then other items    
    const customSortKeys = (keys: string[]): any => {
      const beanKeys = keys.filter((key) => key.includes('BEAN')).sort();
      const otherKeys = keys.filter((key) => !key.includes('BEAN')).sort();
      return [...beanKeys, ...otherKeys];
    };

    return (
      <div ref={ref}>
        {/* Loop through route */}
        {Object.keys(manifest).length > 0 &&
          Object.keys(manifest).map((routeId: string, index: number) => {
            const targetRoute = routes.find(
              (route: IRoutes) => route.id === Number(routeId),
            );
            if (!targetRoute) {
              return;
            }

            // sort the item for each route then loop through it
            const sortedItems: any = customSortKeys(
              Object.keys(manifest[routeId]),
            );

            return (
              <>
                <Typography variant="h4" textAlign="center" m={2}>
                  {targetRoute.name}
                </Typography>
                <Typography variant="h5" m={2}>
                  Driver: {targetRoute.driver?.name}
                </Typography>
                <Table sx={{mx: 2}}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: 15 }}>
                        Item
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: 15 }}>
                        Quantity
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  {sortedItems.length > 0 &&
                    sortedItems.map((item: string, index: number) => {
                      if (manifest[routeId][item] === 0) {
                        return null;
                      }
                      return (
                        <TableRow key={index}>
                          <TableCell sx={{ fontSize: 20 }}>{item}</TableCell>
                          <TableCell sx={{ fontSize: 20, fontWeight: 'bold' }}>
                            {manifest[routeId][item]}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </Table>
                {index < Object.keys(manifest).length - 1 && (
                  <div className="page-break"></div>
                )}
              </>
            );
          })}
      </div>
    );
  },
);
