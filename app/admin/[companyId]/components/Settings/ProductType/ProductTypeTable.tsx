import { IItemType } from '@/app/utils/type';
import {
  AlertColor,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import DeleteModal from '../../Modals/delete/DeleteModal';
import EditProductType from '../../Modals/edit/EditProductType';
import { useMultipleBoolean } from '@/hooks/useMultipleBoolean';
import { getAdminApiUrl } from '@/app/utils/enum';
import axios from 'axios';

interface IProps {
  types: IItemType[];
  showNotification: (type: AlertColor, message: string) => void;
}

export default function ProductTypeTable({ types, showNotification }: IProps) {
  const { companyId }: any = useParams();
  const [open, setOpen] = useMultipleBoolean({
    addProductType: false,
    editProductType: false,
    deleteProductType: false,
  });
  const [edittingType, setEdittingType] = useState<null | IItemType>(null);
  const [deletingType, setDeletingType] = useState<null | IItemType>(null);
  const router = useRouter();

  const onDeleteType = async (type: IItemType) => {
    try {
      const response = await axios.delete(
        getAdminApiUrl(companyId, `/productTypes?id=${type.id}`),
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', 'Product Type deleted successfully');
      setOpen('deleteProductType', false);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', 'Internal Server Error: ' + error);
    }
  };

  return (
    <>
      <DeleteModal
        open={open.deleteProductType}
        handleCloseModal={() => setOpen('deleteProductType', false)}
        handleDelete={onDeleteType}
        targetObj={deletingType}
        showTargetObj={deletingType?.name}
      />
      <EditProductType
        open={open.editProductType}
        onClose={() => setOpen('editProductType', false)}
        showNotification={showNotification}
        type={edittingType}
      />
      <Paper sx={{ width: '100%', overflow: 'scroll' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Products</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {types.length > 0 &&
              types.map((type: IItemType) => {
                return (
                  <TableRow
                    key={type.id}
                    sx={{
                      '&:hover': {
                        cursor: 'pointer',
                        backgroundColor: grey[200],
                      },
                    }}
                    onClick={() => router.push('/admin/productType/' + type.id)}
                  >
                    <TableCell>{type.name}</TableCell>
                    <TableCell>{type.items.length}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Button
                          color="error"
                          onClick={(e: any) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setOpen('deleteProductType', true);
                            setDeletingType(type);
                          }}
                        >
                          Delete
                        </Button>
                        <Button
                          onClick={(e: any) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setOpen('editProductType', true);
                            setEdittingType(type);
                          }}
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
