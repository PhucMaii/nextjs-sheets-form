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

const ITEMS_PER_PAGE = 15; // Adjust this number based on your page width

const splitItemsIntoPages = (items: string[]) => {
  const pages = [];
  for (let i = 0; i < items.length; i += ITEMS_PER_PAGE) {
    pages.push(items.slice(i, i + ITEMS_PER_PAGE));
  }
  return pages;
};

export const NewManifestPrint = forwardRef(
  ({ manifest, currentDate }: PropTypes, ref: any) => {
    if (!manifest || Object.keys(manifest).length === 0) {
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
          {Object.keys(manifest)?.length > 0 &&
            Object.keys(manifest).map((routeId: string, routeIndex: number) => {
              const sortedItems = manifest[routeId]?.itemNames || [];
              const itemPages = splitItemsIntoPages(sortedItems);

              return itemPages.map((pageItems, pageIndex) => (
                <Fragment key={`${routeId}-page-${pageIndex}`}>
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
                      Driver:{' '}
                      {manifest[routeId]?.route?.driver?.name || 'Unknown'}
                    </Typography>
                    <Typography>{currentDate}</Typography>
                  </Box>
                  <Typography sx={{ m: 2 }}>
                    {itemPages.length > 1 &&
                      `Page ${pageIndex + 1}/${itemPages.length}`}
                  </Typography>
                  <Divider sx={{ my: 2 }} />

                  <Table sx={{ mx: 2 }}>
                    <TableHead>
                      <TableRow>
                        <BorderRightTableCell align="center"></BorderRightTableCell>
                        {pageItems.map((item: string, index: number) => {
                          const { summary } = manifest[routeId];
                          if (summary[item] === 0) return null;
                          return (
                            <BorderRightTableCell
                              key={index}
                              align="center"
                              sx={{
                                padding: 2,
                                fontSize: 18,
                                fontWeight: 'bold',
                                width: `${100 / (pageItems.length + 1)}%`,
                              }}
                            >
                              {item}
                            </BorderRightTableCell>
                          );
                        })}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {manifest[routeId]?.details &&
                        manifest[routeId].details.map(
                          (user: any, userIndex: number) => (
                            <TableRow key={userIndex}>
                              <BorderRightTableCell
                                sx={{
                                  fontSize: 18,
                                  height: '30px !important',
                                  fontWeight: 'bold',
                                }}
                              >
                                {user?.user?.displayName} -{' '}
                                {user?.user?.preference?.paymentType} -{' '}
                                {user.user.clientId}
                              </BorderRightTableCell>
                              {pageItems.map(
                                (item: string, itemIndex: number) => {
                                  const itemQuantity = user[item];
                                  const { summary } = manifest[routeId];
                                  if (summary[item] === 0) return null;

                                  if (!itemQuantity || itemQuantity === 0) {
                                    return (
                                      <BorderRightTableCell
                                        align="center"
                                        key={itemIndex}
                                      ></BorderRightTableCell>
                                    );
                                  }

                                  return (
                                    <BorderRightTableCell
                                      align="center"
                                      sx={{ fontSize: 20 }}
                                      key={itemIndex}
                                      $isSelected={itemQuantity > 0}
                                      $productColor={productColors[itemIndex]}
                                    >
                                      {itemQuantity}
                                    </BorderRightTableCell>
                                  );
                                },
                              )}
                            </TableRow>
                          ),
                        )}
                    </TableBody>
                  </Table>

                  {(pageIndex < itemPages.length - 1 ||
                    routeIndex < Object.keys(manifest).length - 1) && (
                    <div className="page-break"></div>
                  )}
                </Fragment>
              ));
            })}
        </Box>
      </div>
    );
  },
);
