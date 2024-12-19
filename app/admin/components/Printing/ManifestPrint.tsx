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
import React, { forwardRef, Fragment } from 'react';
import './print.css';
import styled from 'styled-components';
import { productColors } from '@/app/lib/constant';

interface PropTypes {
  manifest: any;
  routes: IRoutes[];
  currentDate: string;
}

interface TableCellProps {
  $isSelected?: boolean;
  $productColor?: string;
}

const BorderRightTableCell = styled(TableCell)<TableCellProps>`
  border: 1px solid black;
  background-color: ${(props) =>
    props.$isSelected ? props?.$productColor : 'white'} !important;
  padding: 2px;
`;

export const ManifestPrint = forwardRef(
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
      <div ref={ref} className="print-container">
        <Box sx={{ width: '90%', height: '100%' }}>
          {/* Loop through route */}
          {Object.keys(manifest)?.length > 0 &&
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
              // const generateItemNames = () => {
              //   const itemNameList: string[] = [];

              //   // Get all items with its quantity in format: {itemName: quantity}
              //   const currentManifest = manifest[routeId]?.details;

              //   if (!currentManifest) {
              //     return [];
              //   }

              //   // Loop through all items and get its key = name
              //   for (const item of currentManifest) {
              //     const itemNames: string[] = Object.keys(item);
              //     for (const itemName of itemNames) {
              //       if (itemName === 'user') {
              //         continue;
              //       }

              //       if (itemNameList.includes(itemName)) {
              //         continue;
              //       }

              //       if (item[itemName] === 0) {
              //         continue;
              //       }

              //       // if (itemName.includes('KONGNAMUL')) {
              //       //   continue;
              //       // }

              //       itemNameList.push(itemName);
              //     }
              //   }

              //   return itemNameList;
              // };

              // const items = generateItemNames();
              const sortedItems = manifest[routeId]?.itemNames || [];

              const columnWidthPercentage =
                Math.floor(sortedItems?.length / 100) * 100 - 1;

              return (
                <Fragment key={index}>
                  <Typography variant="h4" textAlign="center" m={2}>
                    {manifest[routeId]?.route?.name}
                  </Typography>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    m={2}
                  >
                    <Typography variant="h5">
                      Driver: {manifest[routeId]?.route?.driver?.name}
                    </Typography>
                    <Typography>{currentDate}</Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />

                  <Table sx={{ mx: 2 }}>
                    <TableHead>
                      <TableRow>
                        <BorderRightTableCell align="center"></BorderRightTableCell>
                        {sortedItems?.length > 0 &&
                          sortedItems.map((item: string, index: number) => {
                            const { summary } = manifest[routeId];
                            if (summary[item] === 0) {
                              return null;
                            }
                            return (
                              <Fragment key={index}>
                                <BorderRightTableCell
                                  align="center"
                                  sx={{
                                    padding: 2,
                                    fontSize: 18,
                                    fontWeight: 'bold',
                                    width: `${columnWidthPercentage}%`,
                                  }}
                                >
                                  {item}
                                </BorderRightTableCell>
                              </Fragment>
                            );
                          })}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {manifest[routeId]?.details &&
                        manifest[routeId].details.map(
                          (user: any, index: number) => {
                            const { summary } = manifest[routeId];
                            // let clientName = user.user.clientName
                            //   .split('-')
                            //   .slice(0, 2)
                            //   .join(' - ');

                            // if (
                            //   clientName?.split(' - ')[1] == ' C.O.D' ||
                            //   clientName?.split(' - ')[1] == ' MONTHLY' ||
                            //   clientName?.split(' - ')[1] == ' W.C.O.D'
                            // ) {
                            //   clientName = clientName.split(' - ')[0];
                            // }

                            return (
                              <TableRow key={index}>
                                <BorderRightTableCell
                                  // align="center"
                                  sx={{
                                    fontSize: 18,
                                    // width: '150px',
                                    height: '30px !important',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {user?.user?.displayName} -{' '}
                                  {user?.user?.preference?.paymentType} -{' '}
                                  {user.user.clientId}
                                </BorderRightTableCell>
                                {sortedItems.map(
                                  (item: string, index: number) => {
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
                                          sx={{ fontSize: 20 }}
                                        >
                                          NaN
                                        </BorderRightTableCell>
                                      );
                                    }

                                    return (
                                      <BorderRightTableCell
                                        align="center"
                                        sx={{ fontSize: 20 }}
                                        key={index}
                                        $isSelected={itemQuantity > 0}
                                        $productColor={productColors[index]}
                                      >
                                        {itemQuantity}
                                      </BorderRightTableCell>
                                    );
                                  },
                                )}
                              </TableRow>
                            );
                          },
                        )}
                    </TableBody>
                  </Table>
                  {index < Object.keys(manifest)?.length - 1 && (
                    <div className="page-break"></div>
                  )}
                </Fragment>
              );
            })}
        </Box>
      </div>
    );
  },
);
