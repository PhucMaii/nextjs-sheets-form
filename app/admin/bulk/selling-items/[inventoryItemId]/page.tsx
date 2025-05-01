'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../../../components/Sidebar/Sidebar';
import {
  DataGrid,
  GridColDef,
  GridRenderEditCellParams,
  useGridApiContext,
} from '@mui/x-data-grid';
import useNotification from '@/hooks/useNotification';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import { Box, Button, Checkbox, Paper } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { ShadowSection } from '@/app/admin/reports/styled';
import { ArrowLeftIcon } from 'lucide-react';
import { grey } from '@mui/material/colors';
import { LoadingButton } from '@mui/lab';
import { getUniqueUnitRatios } from '@/app/utils/array';
import BulkEditOptions from '@/app/admin/components/Bulk/BulkEditOptions';
import AddOption from '@/app/admin/components/Modals/add/AddOption';
import AddItem from '@/app/admin/components/Modals/add/AddItem';
import { IItem } from '@/app/utils/type';
import { generateCurrentTime } from '@/app/utils/time';
import BulkEditItem from '@/app/admin/components/Bulk/BulkEditItem';
// import AddItem from '@/app/admin/components/Modals/add/AddItem';

function OptionsEditCell(props: GridRenderEditCellParams) {
  const { id, field, value } = props;
  const apiRef = useGridApiContext();

  const [localValue, setLocalValue] = React.useState(
    Array.isArray(value) ? value.map((opt: any) => opt.name).join(', ') : '',
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setLocalValue(inputValue);

    const updatedOptions = inputValue
      .split(',')
      .map((name) => ({ name: name.trim() }))
      .filter((opt) => opt.name !== '');

    apiRef.current.setEditCellValue(
      { id, field, value: updatedOptions },
      event,
    );
  };

  return (
    <input
      type="text"
      value={localValue}
      onChange={handleChange}
      style={{ width: '100%' }}
    />
  );
}

export default function BulkEditItems() {
  const { inventoryItemId }: any = useParams();

  const [addOptionProps, setAddOptionProps] = useState<any>({
    open: false,
    item: null,
  });
  const [editOptionProps, setEditOptionProps] = useState<any>({
    open: false,
    item: null,
  });
  const [editBulkItemProps, setEditBulkItemProps] = useState<any>({
    open: false,
    item: null,
  });
  const [isOpenAddItem, setIsOpenAddItem] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  // const [isOpenAddItem, setIsOpenAddItem] = useState<boolean>(false);
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);

  const router = useRouter();

  const [items, setItems] = useState<any>([]);

  const { showNotification, NotificationComp } = useNotification();

  const columns: GridColDef[] = [
    {
      field: 'category.name',
      headerName: 'Category',
      renderCell: (params) => <span>{params.row.category?.name || '—'}</span>,
      width: 400,
    },
    {
      field: 'name',
      headerName: 'Name',
      editable: true,
      width: 200,
      renderCell: (params) => (
        <span
          onClick={() => {
            setEditBulkItemProps({ open: true, item: params.row });
          }}
        >
          {params.row.name || '—'}
        </span>
      ),
    },
    {
      field: 'price',
      headerName: 'Price',
      editable: true,
      type: 'number',
      renderCell: (params) => {
        const isDisabled = params.row.options?.length > 0;
        return (
          <span
            style={{
              color: isDisabled ? 'gray' : 'inherit',
              fontStyle: isDisabled ? 'italic' : 'normal',
            }}
            onClick={() => {
              setEditBulkItemProps({ open: true, item: params.row });
            }}
          >
            {params.value}
          </span>
        );
      },
    },
    {
      field: 'options',
      headerName: 'Options',
      editable: true,
      width: 300,
      renderCell: (params) => {
        const options = params.row.options;
        // console.log(options, 'OPTIONS');
        const optionsRender = options?.map((opt: any) => opt.name).join(', ');

        console.log(optionsRender, 'OPTIONS RENDER');

        if (Array.isArray(options) && options.length > 0) {
          return (
            <div
              onClick={(e: any) => {
                e.stopPropagation();
                e.preventDefault();
                setEditOptionProps({ open: true, item: params.row });
              }}
              style={{ cursor: 'pointer' }}
            >
              {optionsRender}
            </div>
          );
        } else {
          return (
            <div
              onClick={(e: any) => {
                e.stopPropagation();
                e.preventDefault();
                setAddOptionProps({ open: true, item: params.row });
              }}
              style={{ cursor: 'pointer' }}
            >
              N/A
            </div>
          );
        }
      },
      renderEditCell: (params) => <OptionsEditCell {...params} />,
    },
    {
      field: 'isShowDiscount',
      headerName: 'Show Discount',
      editable: true,
      type: 'boolean',
      renderCell: (params) => {
        return (
          <span
            onClick={() => {
              setEditBulkItemProps({ open: true, item: params.row });
            }}
          >
            {params.row.isShowDiscount ? (
              <Checkbox checked={true} />
            ) : (
              <Checkbox checked={false} />
            )}
          </span>
        );
      },
    },
    {
      field: 'prevPrice',
      headerName: 'Prev price',
      editable: true,
      type: 'number',
      renderCell: (params) => {
        return (
          <span
            onClick={() => {
              setEditBulkItemProps({ open: true, item: params.row });
            }}
          >
            {params.row?.prevPrice || '—'}
          </span>
        );
      },
    },
    {
      field: 'inventoryUnitId',
      headerName: 'Unit',
      editable: true,
      type: 'singleSelect', // This tells the DataGrid to use dropdown
      // valueGetter: (params) => params?.row?.inventoryUnit?.unit || '—',
      valueOptions: (params) => {
        // console.log(params, 'PARAMS');
        const inventoryItemUnits =
          params.row.inventoryItem?.vendorItem?.flatMap(
            (item: any) => item.unit,
          ) || [];

        const sellingUnits = getUniqueUnitRatios(inventoryItemUnits);
        // Assuming it returns array like [{value: 1, label: 'kg'}]

        return sellingUnits.map((unit: any) => ({
          value: unit.id,
          label: unit.unit,
        }));
      },
    },
  ];

  useEffect(() => {
    fetchItems();
  }, []);

  // const onAddItem = (newItem: any, categories: any) => {
  //   const newItemsWithCategory = categories.map((category: any) => {
  //     const tempNewItem = {
  //       ...newItem,
  //       inventoryUnit: newItem.unit,
  //       inventoryUnitId: Number(newItem.unit.id),
  //       availability: true,
  //       isShowDiscount: false,
  //       prevPrice: 0,
  //       category,
  //     };

  //     console.log(tempNewItem, 'TEMP NEW ITEM');

  //     return tempNewItem;
  //   });

  //   setItems([...items, ...newItemsWithCategory]);
  // };

  const fetchItems = async () => {
    try {
      const response = await axios.get(
        `${API_URL.ADMIN}/items?inventoryItemId=${inventoryItemId}`,
      );

      if (response.data.data) {
        setItems(response.data.data);
      }
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', 'There was an error: ' + error);
    }
  };

  const handleRowUpdate = async (newRow: any) => {
    const targetItem = items.map((item: any) => {
      if (item.id === newRow.id) {
        return newRow;
      }
      return item;
    });

    // console.log({ targetItem, newRow }, 'targetItem');

    setItems(targetItem);
    return newRow; // This is required
  };

  const handleSaveChanges = async () => {
    if (selectedItemIds.length === 0) {
      showNotification('error', 'Please select at least one item to update');
      return;
    }
    setIsLoading(true);
    try {
      const selectedItems = items.filter((item: any) => {
        return selectedItemIds.includes(item.id);
      });

      const response = await axios.put(`${API_URL.ADMIN}/bulk/selling-items`, {
        items: selectedItems,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
      }

      if (response.data.data) {
        showNotification('success', response.data.message);
        // router.push('/admin/inventory');
      }
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', 'There was an error: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkIsNewItemValid = (newItem: IItem) => {
    if (
      newItem.name.trim() === '' ||
      newItem.price < 0 ||
      !newItem.categoryId ||
      !newItem.inventoryItemId ||
      newItem.inventoryItemId < 1
    ) {
      console.log(newItem, 'NEW ITEM');
      showNotification('error', 'Your input data is invalid');
      return false;
    }
    return true;
  };

  const handleAddItem = async (
    newItem: IItem,
    selectedCategoryIds: number[],
  ) => {
    try {
      const isNewItemValid = checkIsNewItemValid(newItem);
      if (!isNewItemValid) {
        return;
      }

      const createdAt = generateCurrentTime();
      const response = await axios.post(API_URL.ITEM, {
        newItem,
        createdAt,
        categoryIds: selectedCategoryIds,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      fetchItems();

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', error.response.data.error);
    }
  };

  return (
    <Sidebar>
      <AddItem
        addItem={handleAddItem}
        showNotification={showNotification}
        open={isOpenAddItem}
        onClose={() => setIsOpenAddItem(false)}
        defaultItem={{
          inventoryItemId: Number(inventoryItemId),
          name: items[0]?.name,
        }}
      />
      {editBulkItemProps.open && editBulkItemProps.item && (
        <BulkEditItem
          open={editBulkItemProps.open}
          onClose={() => setEditBulkItemProps({ open: false, item: null })}
          item={editBulkItemProps.item}
          showNotification={showNotification}
          refresh={fetchItems}
        />
      )}
      {NotificationComp}
      {editOptionProps.open && editOptionProps.item && (
        <BulkEditOptions
          open={editOptionProps.open}
          onClose={() => setEditOptionProps({ open: false, item: null })}
          item={editOptionProps.item}
          setItems={setItems}
          showNotification={showNotification}
        />
      )}

      {addOptionProps.open && addOptionProps.item && (
        <AddOption
          item={addOptionProps.item}
          showNotification={showNotification}
          open={addOptionProps.open}
          setItems={setItems}
          onClose={() => setAddOptionProps({ open: false, item: null })}
          // noIncludeBulkAdd
        />
      )}
      <ShadowSection>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Button
            size="small"
            onClick={() => router.back()}
            sx={{ color: grey[800] }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <ArrowLeftIcon />
              <span>Back</span>
            </Box>
          </Button>

          <Box display="flex" alignItems="center" gap={1}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setIsOpenAddItem(true)}
            >
              + Add Item
            </Button>
            <LoadingButton
              onClick={handleSaveChanges}
              variant="contained"
              size="small"
              loading={isLoading}
            >
              Save Changes
            </LoadingButton>
          </Box>
        </Box>
        <Paper elevation={0} sx={{ mt: 2 }}>
          <DataGrid
            rows={items}
            columns={columns}
            checkboxSelection
            disableRowSelectionOnClick
            onRowClick={(params) => {
              setEditBulkItemProps({ open: true, item: params.row });
            }}
            processRowUpdate={handleRowUpdate}
            experimentalFeatures={{ newEditingApi: true } as any}
            onRowSelectionModelChange={(newSelection) => {
              setSelectedItemIds(newSelection as number[]); // or string[] depending on your ID type
            }}
            isCellEditable={(params) => {
              if (params.field === 'price') {
                return !(params.row.options?.length > 0);
              }
              return true;
            }}
          />
        </Paper>
      </ShadowSection>
    </Sidebar>
  );
}
