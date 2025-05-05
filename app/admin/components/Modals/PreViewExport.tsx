import { Box, Button, Modal, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React, { useEffect, useRef, useState } from 'react';
import { ModalProps } from './type';
import { IItem } from '@/app/utils/type';
import { BoxModal } from './styled';
import { generateImgUrl } from '@/app/lib/s3';
import ExportCategory from '../Printing/ExportCategory';
import { useReactToPrint } from 'react-to-print';

interface PreViewExportProps extends ModalProps {
  items: IItem[];
}

const PreViewExport = ({ open, onClose, items }: PreViewExportProps) => {
  const [exportedItems, setExportedItems] = useState<IItem[]>([]);

  const exportCategoryRef = useRef(null);

  useEffect(() => {
    if (items) {
      // Init items
      const newItems = items.map((item: IItem) => {
        const uom = extractUOM(item.name, item.inventoryUnit?.unit);
        const category = item.inventoryItem?.type?.name;
        return {
          ...item,
          uom,
          category,
        };
      });
      setExportedItems(newItems);
    }
  }, [items]);

  const columns: GridColDef[] = [
    {
      field: 'image',
      headerName: 'Image',
      width: 100,
      renderCell: (params: any) => {
        if (!params.row?.inventoryItem?.image) return null;
        return (
          <img
            src={generateImgUrl(params.row?.inventoryItem?.image)}
            alt={params.row.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        );
      },    
      editable: true,
    },
    {
      field: 'name',
      headerName: 'Item',
      width: 200,
      editable: true,
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 200,
      editable: true,
    },
    {
      field: 'uom',
      headerName: 'UOM',
      width: 200,
      editable: true,
      //   renderCell: (params: any) => {
      //     const uom = params.row.inventoryUnit?.unit;
      //     return <Typography>{uom}</Typography>;
      //   },
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 200,
      editable: true,
      type: 'number',
    },
  ];

  console.log(exportedItems, 'exportedItems');

  const onRowUpdate = (newRow: IItem) => {
    const targetItem = exportedItems.map((item: IItem) => {
      if (item.id === newRow.id) {
        return newRow;
      }
        return item;
      });

      setExportedItems(targetItem);
      return newRow;
    };

  const handleExport = useReactToPrint({
    content: () => exportCategoryRef.current,
  });

  const extractUOM = (itemName: string, fallback: string) => {
    const splittedName = itemName.split(' - ');

    let uom = splittedName.length > 1 ? splittedName[splittedName.length - 1] : null;
    
    // If name has hyphen, extract last 2 words
    if (uom) {
        // only extract last 2 words
        const splittedUom = uom.split(' ');

        if (splittedUom.length > 1) {
            uom = splittedUom[splittedUom.length - 2] + ' ' + splittedUom[splittedUom.length - 1];
            return uom;
        }

        return uom + ' counts';
    } else {
     // Check if last 2 words has number, then return last 2 words
     if (itemName.match(/\d/)) {
        const splittedItemName = itemName.split(' ');
        uom = splittedItemName[splittedItemName.length - 2] + ' ' + splittedItemName[splittedItemName.length - 1];
        return uom
     }

     return fallback;
    }
    
  }

  return (
    <>
      <div style={{ display: 'none' }}>
        <ExportCategory
          ref={exportCategoryRef}
          items={exportedItems}
        />
      </div>
      <Modal open={open} onClose={onClose}>
        <BoxModal maxHeight="80vh" overflow="auto">
          <Box display="flex" flexDirection="column" gap={2}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h5">Export Category</Typography>
              <Button variant="contained" color="primary" onClick={handleExport}>
                Export
              </Button>
            </Box>

            <DataGrid
              columns={columns}
              rows={exportedItems}
              processRowUpdate={onRowUpdate}
              // editMode="cell"
            />
          </Box>
        </BoxModal>
      </Modal>
    </>
  );
};

export default PreViewExport;
