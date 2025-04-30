import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import React, { useState } from 'react';
import DisplayFile from '../Modals/DisplayFile';
import ViewImg from '../ViewImg';

interface IProps {
  productLossList: any[];
}

export default function ProductLossTable({ productLossList }: IProps) {
  const [viewImgProps, setViewImgProps] = useState<any>({
    open: false,
    fileKey: '',
  });

  return (
    <>
      <ViewImg
        open={viewImgProps.open}
        fileKeyFront={viewImgProps.fileKey}
        onClose={() => setViewImgProps({ fileKey: '', open: false })}
      />
      <TableContainer elevation={0} component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Id</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Cost</TableCell>
              <TableCell>Loss Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Reported By</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productLossList.map((productLoss) => (
              <TableRow key={productLoss.id}>
                <TableCell onClick={() => setViewImgProps({ fileKey: productLoss.medias[0].fileKey, open: true })}>
                  {productLoss.medias[0] && (
                    <DisplayFile
                      fileKey={productLoss.medias[0].fileKey}
                      alt="product loss"
                      width="50px"
                      height="50px"
                    />
                  )}
                </TableCell>
                <TableCell>#{productLoss.id}</TableCell>
                <TableCell>{productLoss.inventoryItem.name}</TableCell>
                <TableCell>
                  {productLoss.quantityLost} {productLoss?.inventoryUnit?.unit}
                </TableCell>
                <TableCell>${productLoss.totalCost?.toFixed(2)}</TableCell>
                <TableCell>{productLoss?.lossType}</TableCell>
                <TableCell>{productLoss?.description}</TableCell>
                <TableCell>{productLoss?.reportedBy}</TableCell>
                <TableCell>{productLoss?.reportedDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
