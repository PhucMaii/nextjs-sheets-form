import { IRoutes } from '@/app/utils/type';
import {
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React, { forwardRef } from 'react';
import './print.css';
import { printFontSize } from './ComponentToPrint';

interface PropTypes {
  manifest: any;
  routes: IRoutes[];
}

export const ManifestPrint = forwardRef(
  ({ manifest, routes }: PropTypes, ref: any) => {
    if (!manifest || Object.keys(manifest).length === 0) {
      return;
    }

    // Display the beansprouts first then other items
    const customSortKeys = (keys: string[]): any => {
      const beanKeys = keys.filter((key) => key.includes('BEAN')).sort();
      const otherKeys = keys.filter((key) => !key.includes('BEAN')).sort();
      return [...beanKeys, ...otherKeys];
    };

    return (
      <div ref={ref}>
        <Box sx={{ width: '100%', height: '100%', m: 2 }}>
          {/* Loop through route */}
          {Object.keys(manifest).length > 0 &&
            Object.keys(manifest).map((routeId: string, index: number) => {
              const targetRoute = routes.find(
                (route: IRoutes) => route.id === Number(routeId),
              );
              if (!targetRoute) {
                return null;
              }

              // sort the item for each route then loop through it
              const sortedItems: any = customSortKeys(
                Object.keys(manifest[routeId].summary),
              );

              return (
                <>
                  <Typography variant="h4" textAlign="center" m={2}>
                    {targetRoute.name}
                  </Typography>
                  <Typography variant="h5" m={2}>
                    Driver: {targetRoute.driver?.name}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Box display="flex" flexDirection="column" gap={1} m={2}>
                    <Typography variant="h5" m={2}>
                      Summary
                    </Typography>
                    {/* <Box
                    display="flex"
                    alignItems="center"
                    flexWrap="wrap"
                    justifyContent="space-between"
                    gap={1}
                  > */}
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Item</TableCell>
                          <TableCell>Quantity</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sortedItems.length > 0 &&
                          sortedItems.map((item: string, index: number) => {
                            const { summary } = manifest[routeId];
                            if (summary[item] === 0) {
                              return null;
                            }
                            return (
                              <TableRow key={index}>
                                <TableCell
                                  sx={{ fontSize: printFontSize - 10 }}
                                >
                                  {item}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    fontSize: printFontSize - 10,
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {summary[item]}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                    {/* </Box> */}
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  {manifest[routeId].details.map(
                    (user: any, userIndex: number) => {
                      const { summary } = manifest[routeId];
                      return (
                        <Box
                          display="flex"
                          // flexDirection="column"
                          gap={2}
                          m={2}
                          key={userIndex}
                          flexWrap="wrap"
                          alignItems="center"
                        >
                          <Typography variant="h6" m={2}>
                            {user.user.clientName}:
                          </Typography>
                          {/* <Box
                          display="flex"
                          alignItems="center"
                          flexWrap="wrap"
                          justifyContent="space-between"
                          gap={1}
                        > */}
                          {sortedItems.map((item: any, itemIndex: number) => {
                            if (
                              summary[item] === 0 ||
                              !user[item] ||
                              user[item] === 0
                            ) {
                              return null;
                            }

                            return (
                              <Typography key={itemIndex} variant="body1">
                                {item}: {user[item]}
                                {/* <TableCell
                                sx={{ fontSize: 20, fontWeight: 'bold' }}
                              >
                                {summary[item]}
                              </TableCell> */}
                              </Typography>
                            );
                          })}
                          {/* </Box> */}
                        </Box>
                      );
                    },
                  )}
                  {/* <Table sx={{ mx: 2 }}>
                  <TableHead>
                    <TableRow>
                      <BorderRightTableCell align="center"></BorderRightTableCell>
                      {sortedItems.length > 0 &&
                        sortedItems.map((item: string, index: number) => {
                          const { summary } = manifest[routeId];
                          if (summary[item] === 0) {
                            return null;
                          }
                          return (
                            <>
                              <BorderRightTableCell
                                align="center"
                                sx={{ fontSize: 20 }}
                                key={index}
                              >
                                {item} ({summary[item]})
                              </BorderRightTableCell>
                            </>
                          );
                        })}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {manifest[routeId].details.map(
                      (user: any, index: number) => {
                        const { summary } = manifest[routeId];
                        return (
                          <TableRow key={index}>
                            <BorderRightTableCell
                              align="center"
                              sx={{
                                fontSize: printFontSize,
                                maxWidth: '120px',
                              }}
                            >
                              {user.user.clientName}
                            </BorderRightTableCell>
                            {sortedItems.map((item: string, index: number) => {
                              const itemQuantity = user[item];
                              if (summary[item] === 0) {
                                return null;
                              }

                              if (!itemQuantity || itemQuantity === 0) {
                                return (
                                  <BorderRightTableCell
                                    align="center"
                                    key={index}
                                  ></BorderRightTableCell>
                                );
                              }
                              // Ensure the value is renderable
                              if (typeof itemQuantity === 'object') {
                                console.error(
                                  `Invalid value to render for key ${item}: `,
                                  itemQuantity,
                                );
                                return (
                                  <BorderRightTableCell
                                    key={itemQuantity}
                                    align="center"
                                    sx={{ fontSize: printFontSize }}
                                  >
                                    [Object]
                                  </BorderRightTableCell>
                                );
                              }
                              // console.log({userName: user.user.clientName, item: user[item]})
                              return (
                                <BorderRightTableCell
                                  align="center"
                                  sx={{ fontSize: printFontSize }}
                                  key={index}
                                >
                                  {itemQuantity}
                                </BorderRightTableCell>
                              );
                            })}
                          </TableRow>
                        );
                      },
                    )}
                  </TableBody>
                </Table> */}
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
