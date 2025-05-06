'use client';
import { Box, Button, Checkbox, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { IItem } from '@/app/utils/type';
import { generateImgUrl } from '@/app/lib/s3';
import { useReactToPrint } from 'react-to-print';
import Sidebar from '@/app/admin/components/Sidebar/Sidebar';
import { useParams } from 'next/navigation';
import { fetchApi } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import ExportCategory from '@/app/admin/components/Printing/ExportCategory';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import { ShadowSection } from '@/app/admin/reports/styled';
import EditItemImage from '@/app/admin/components/Modals/EditItemImage';

const ItemExportPage = () => {
  const { id }: any = useParams();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [openEditImgProps, setOpenEditImgProps] = useState<{
    open: boolean;
    item: IItem | null;
  }>({
    open: false,
    item: null,
  });
  const [baseItems, setBaseItems] = useState<IItem[]>([]);
  const [exportedItems, setExportedItems] = useState<IItem[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);

  const exportCategoryRef = useRef(null);

  const selectedItems = useMemo(() => {
    if (
      !exportedItems ||
      exportedItems.length === 0 ||
      !selectedItemIds ||
      selectedItemIds.length === 0
    )
      return [];
    return exportedItems.filter((item) => selectedItemIds.includes(item.id));
  }, [exportedItems, selectedItemIds]);

  const fetchBaseItems = async () => {
    const items = await fetchApi(`${API_URL.ADMIN}/items?categoryId=${id}`);
    setBaseItems(items);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBaseItems();
  }, []);

  useEffect(() => {
    if (baseItems) {
      // Init items
      const newItems = baseItems.map((item: IItem) => {
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
  }, [baseItems]);

  const columns: GridColDef[] = [
    {
      field: 'image',
      headerName: 'Image',
      width: 100,
      renderCell: (params: any) => {
        if (!params.row?.image && !params.row?.inventoryItem?.image) return null;
        return (
          <img
            src={generateImgUrl(params.row?.image || params.row?.inventoryItem?.image)}
            alt={params.row.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
            onClick={() => {
              setOpenEditImgProps({ open: true, item: params.row });
            }}
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
    // {
    //   field: 'category',
    //   headerName: 'Category',
    //   width: 200,
    //   editable: true,
    // },
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
    {
      field: 'availability',
      headerName: 'Available',
      width: 200,
      renderCell: (params) => (
        <Checkbox
          checked={params.row.availability}
          onChange={(e) =>
            handleAvailabilityChange(params.row.id, e.target.checked)
          }
          inputProps={{ 'aria-label': 'Toggle availability' }}
        />
      ),
    },
  ];

  const handleAvailabilityChange = (id: number, checked: boolean) => {
    const targetItem = exportedItems.map((item: IItem) => {
      if (item.id === id) {
        return { ...item, availability: checked };
      }
      return item;
    });

    setExportedItems(targetItem);
  };

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

    let uom =
      splittedName.length > 1 ? splittedName[splittedName.length - 1] : null;

    // If name has hyphen, extract last 2 words
    if (uom) {
      if (itemName.match(/\d/)) {
        // only extract last 2 words
        const splittedUom = uom.split(' ');

        if (splittedUom.length > 1) {
          // If the .length - 2 is number, then return the last 2 words
          if (splittedUom[splittedUom.length - 2].match(/\d/)) {
            uom =
              splittedUom[splittedUom.length - 2] +
              ' ' +
              splittedUom[splittedUom.length - 1];
            return uom;
          } else {
            // return last 1 word
            uom = splittedUom[splittedUom.length - 1];
            return uom;
          }
        }
      } else {
        return fallback;
      }

      if (uom.match(/\d/)) {
        uom = uom.split(' ')[uom.split(' ').length - 1];
        return uom + ' counts';
      }
    } else {
      // Check if last 2 words has number, then return last 2 words
      if (itemName.match(/\d/)) {
        const splittedItemName = itemName.split(' ');

        if (splittedItemName.length > 1) {
          // If the .length - 2 is number, then return the last 2 words
          if (splittedItemName[splittedItemName.length - 2].match(/\d/)) {
            uom =
              splittedItemName[splittedItemName.length - 2] +
              ' ' +
              splittedItemName[splittedItemName.length - 1];
            return uom;
          } else {
            // return last 1 word
            uom = splittedItemName[splittedItemName.length - 1];

            if (uom.match(/\d/)) {
              return fallback;
            }
            return uom;
          }
        }
        uom =
          splittedItemName[splittedItemName.length - 2] +
          ' ' +
          splittedItemName[splittedItemName.length - 1];
        return uom;
      }

      return fallback;
    }
  };

  if (isLoading) {
    return (
      <Sidebar>
        <LoadingComponent />
      </Sidebar>
    );
  }

  console.log(selectedItemIds, 'selectedItemIds');

  return (
    <Sidebar>
      {openEditImgProps.item && (
        <EditItemImage
          open={openEditImgProps.open}
          onClose={() => setOpenEditImgProps({ open: false, item: null })}
          image={
            openEditImgProps?.item?.image ||
            openEditImgProps?.item?.inventoryItem?.image ||
            ''
          }
          onUpdateImg={(img) => {
            const targetItem = exportedItems.map((item: IItem) => {
              if (item.id === openEditImgProps.item?.id) {
                return { ...item, image: img };
              }
              return item;
            });

            setExportedItems(targetItem);
          }}
        />
      )}
      <div style={{ display: 'none' }}>
        <ExportCategory ref={exportCategoryRef} items={selectedItems} />
      </div>
      <ShadowSection>
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
            checkboxSelection
            disableRowSelectionOnClick
            onRowSelectionModelChange={(newRowSelectionModel) => {
              setSelectedItemIds(newRowSelectionModel as number[]);
            }}
            // editMode="cell"
          />
        </Box>
      </ShadowSection>
    </Sidebar>
  );
};

export default ItemExportPage;
