import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
} from '@mui/material';
import React, { useState } from 'react';
import DisplayFile from '../Modals/DisplayFile';
import ViewImg from '../ViewImg';
import EditProductLoss from '../Modals/edit/EditProductLoss';
import { grey } from '@mui/material/colors';
import { ShowNotificationType } from '@/hooks/useNotification';

interface IProps {
  productLossList: any[];
  showNotification?: ShowNotificationType;
  refresh?: () => Promise<void>;
  mode?: 'view' | 'edit';
}

export default function ProductLossTable({
  productLossList,
  showNotification,
  refresh,
  mode = 'edit',
}: IProps) {
  const [editProps, setEditProps] = useState<any>({
    open: false,
    productLoss: null,
  });
  const [viewImgProps, setViewImgProps] = useState<any>({
    open: false,
    fileKey: '',
  });

  const renderTableHeader = () => (
    <TableHead>
      <TableRow>
        <TableCell>Evidence</TableCell>
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
  );

  const renderTableBody = () => (
    <TableBody>
      {productLossList.map((productLoss) => (
        <TableRow
          key={productLoss.id}
          sx={{
            '&:hover': {
              backgroundColor: grey[100],
            },
          }}
          onClick={() => {
            setEditProps({
              open: true,
              productLoss,
            });
          }}
        >
          <TableCell
            onClick={(e: any) => {
              e.stopPropagation();
              setViewImgProps({
                fileKey: productLoss.medias[0].fileKey,
                open: true,
              });
            }}
          >
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
  );

  const renderTable = () => {
    const tableContent = (
      <Table stickyHeader={mode === 'view'}>
        {renderTableHeader()}
        {renderTableBody()}
      </Table>
    );

    if (mode === 'view') {
      return (
        <Box sx={{ height: 350, overflow: 'auto' }}>
          <TableContainer elevation={0} component={Paper} sx={{ height: 380 }}>
            {tableContent}
          </TableContainer>
        </Box>
      );
    }

    return (
      <TableContainer elevation={0} component={Paper} sx={{ height: '100%' }}>
        {tableContent}
      </TableContainer>
    );
  };

  return (
    <>
      {mode === 'edit' &&
        editProps.productLoss &&
        showNotification &&
        refresh && (
          <EditProductLoss
            open={editProps.open}
            onClose={() => setEditProps({ open: false, productLoss: null })}
            productLoss={editProps.productLoss}
            showNotification={showNotification}
            refresh={refresh}
          />
        )}
      <ViewImg
        open={viewImgProps.open}
        fileKeyFront={viewImgProps.fileKey}
        onClose={() => setViewImgProps({ fileKey: '', open: false })}
      />

      {renderTable()}
    </>
  );
}
