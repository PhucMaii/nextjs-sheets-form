import { IOption } from '@/app/utils/type';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import DeleteModal from '../Modals/delete/DeleteModal';
import { ShowNotificationType } from '@/hooks/useNotification';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import EditOption from '../Modals/edit/EditOption';
import { Discount } from '@mui/icons-material';
import DeleteOption from '../Modals/delete/DeleteOption';

interface IProps {
  options: IOption[];
  showNotification: ShowNotificationType;
}

export default function OptionsTable({ options, showNotification }: IProps) {
  const [deleteProps, setDeleteProps] = useState<any>({
    open: false,
    option: null,
  });
  const [editProps, setEditProps] = useState<any>({
    open: false,
    option: null,
  });
  // const [isShowPrevPrice, setIsShowPrevPrice] = useState<boolean>(false);

  const handleDeleteOption = async (targetOption: IOption) => {
    try {
      const response = await axios.delete(
        `${API_URL.ADMIN}/options?id=${targetOption?.id}`,
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('Fail to delete option: ' + error);
      showNotification('error', 'Fail to delete option: ' + error);
    }
  };

  return (
    <>
      {editProps.open && editProps.option && (
        <EditOption
          open={editProps.open}
          onClose={() => setEditProps({ open: false, option: null })}
          option={editProps.option}
          showNotification={showNotification}
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
        />
      )}
      <Paper elevation={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Price</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {options.map((option: IOption, index: number) => {
              return (
                <TableRow key={index}>
                  <TableCell>{option.name}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography>${option.price.toFixed(2)}</Typography>
                      {option?.isShowDiscount && (
                        <IconButton>
                          <Discount color="error" />
                        </IconButton>
                      )}

                    </Box>
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}
