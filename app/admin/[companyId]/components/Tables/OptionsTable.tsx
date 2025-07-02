import { IOption } from '@/app/utils/type';
import {
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import React, { useState } from 'react';
import { ShowNotificationType } from '@/hooks/useNotification';
import EditOption from '../Modals/edit/EditOption';
import DeleteOption from '../Modals/delete/DeleteOption';
import { Trash2Icon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import { useParams } from 'next/navigation';

interface IProps {
  options: IOption[];
  showNotification: ShowNotificationType;
  noIncludeOption?: boolean;
  // setItems?: any;
  onChangeOptions?: any;
  inventoryItemId: number | null;
  onRemoveOption?: any;
}

export default function OptionsTable({
  options,
  showNotification,
  noIncludeOption,
  // setItems,
  onChangeOptions,
  inventoryItemId,
  onRemoveOption
}: IProps) {
  const { companyId }: any = useParams();

  const { data: units } = useQuery({
    queryKey: ['units', inventoryItemId],
    queryFn: async () => {
      const res = await axios.get(
        getAdminApiUrl(companyId, `/units?inventoryItemId=${inventoryItemId}`),
      );
      return res.data.data;
    },
    enabled: !!inventoryItemId,
  });

  const [deleteProps, setDeleteProps] = useState<any>({
    open: false,
    option: null,
  });
  const [editProps, setEditProps] = useState<any>({
    open: false,
    option: null,
  });

  return (
    <>
      {editProps.open && editProps.option && (
        <EditOption
          open={editProps.open}
          onClose={() => setEditProps({ open: false, option: null })}
          option={editProps.option}
          showNotification={showNotification}
          noIncludeOption={noIncludeOption}
        />
      )}
      {deleteProps.open && deleteProps.option && (
        // <DeleteModal
        //   open={deleteProps.open}
        //   handleCloseModal={() =>
        //     setDeleteProps({ open: false, option: options[0] })
        //   }
        //   handleDelete={handleDeleteOption}
        //   targetObj={deleteProps.option}
        //   showTargetObj={deleteProps?.option?.name}
        // />
        <DeleteOption
          open={deleteProps.open}
          onClose={() => setDeleteProps({ open: false, option: options[0] })}
          option={deleteProps.option}
          allOptions={options}
          showNotification={showNotification}
          // setItems={setItems}
        />
      )}
      <Paper elevation={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Previous Price</TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {options.map((option: IOption, index: number) => {
              return (
                <TableRow key={index}>
                  <TableCell>
                    <OutlinedInput
                      value={option.name}
                      onChange={(e: any) => {
                        onChangeOptions(option.id, 'name', e.target.value);
                      }}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={option.unitId}
                      onChange={(e: any) =>
                        onChangeOptions(option.id, 'unitId', +e.target.value)
                      }
                    >
                      {units &&
                        units.map((unit: any) => {
                          return (
                            <MenuItem key={unit.id} value={unit.id}>
                              1:{unit.ratio} - {unit.unit}
                            </MenuItem>
                          );
                        })}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <OutlinedInput
                      value={option.price}
                      onChange={(e: any) => {
                        onChangeOptions(option.id, 'price', +e.target.value);
                      }}
                      startAdornment={
                        <InputAdornment position="start">$</InputAdornment>
                      }
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <OutlinedInput
                      value={option?.prevPrice || 0}
                      onChange={(e: any) => {
                        onChangeOptions(
                          option.id,
                          'prevPrice',
                          +e.target.value,
                        );
                      }}
                      fullWidth
                      startAdornment={
                        <InputAdornment position="start">$</InputAdornment>
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={option?.isShowDiscount || false}
                          onChange={(e: any) => {
                            onChangeOptions(
                              option.id,
                              'isShowDiscount',
                              e.target.checked,
                            );
                          }}
                        />
                      }
                      label="Show Discount"
                      labelPlacement="end"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => {
                      if (onRemoveOption) {
                        onRemoveOption(option.id)
                      }
                      }}>
                      <Trash2Icon style={{ width: 20, height: 20 }} />
                    </IconButton>
                  </TableCell>
                  {/* <TableCell>
                    <Box display="flex" gap={1} alignItems="center">
                      <Button
                        color="error"
                        onClick={() => setDeleteProps({ open: true, option })}
                      >
                        Delete
                      </Button>
                      <Button
                        onClick={() => setEditProps({ open: true, option })}
                      >
                        Edit
                      </Button>
                    </Box>
                  </TableCell> */}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}
