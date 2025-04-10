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
import { Paper } from '@mui/material';
import { useParams } from 'next/navigation';

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

  const [items, setItems] = useState<any>([]);

  const { showNotification, NotificationComp } = useNotification();

  const columns: GridColDef[] = [
    { field: 'category.name', headerName: 'Category' },
    { field: 'name', headerName: 'Name', editable: true },
    {
      field: 'price',
      headerName: 'Price',
      editable: true,
      type: 'number',
    },
    {
      field: 'options',
      headerName: 'Options',
      editable: true,
      width: 400,
      renderCell: (params) => {
        const options = params.row.options;
        console.log(options, 'OPTIONS');
        const optionsRender = options?.map((opt: any) => opt.name).join(', ');

        if (Array.isArray(options) && options.length > 0) {
          return <div>{optionsRender}</div>;
        }
      },
      renderEditCell: (params) => <OptionsEditCell {...params} />,
    },
    {
      field: 'isShowDiscount',
      headerName: 'Show Discount',
      editable: true,
      type: 'boolean',
    },
    { field: 'prevPrice', headerName: 'Prev price', editable: true },
  ];

  useEffect(() => {
    fetchItems();
  }, []);

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

  return (
    <Sidebar>
      {NotificationComp}
      <Paper>
        <DataGrid rows={items} columns={columns} />
      </Paper>
    </Sidebar>
  );
}
