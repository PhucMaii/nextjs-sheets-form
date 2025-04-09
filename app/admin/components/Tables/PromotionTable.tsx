import { IPromotion } from '@/app/utils/type';
import {
  Button,
  MenuItem,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import React, { useState } from 'react';
import StatusText from '../StatusText';
import { API_URL, PROMOTION_STATUS } from '@/app/utils/enum';
import EditPromotion from '../Modals/edit/EditPromotion';
import { grey } from '@mui/material/colors';
import axios from 'axios';
import { ShowNotificationType } from '@/hooks/useNotification';
import LoadingModal from '../Modals/LoadingModal';
import DeleteModal from '../Modals/delete/DeleteModal';

interface IProps {
  promotions: IPromotion[];
  showNotification: ShowNotificationType;
}

export default function PromotionTable({
  promotions,
  showNotification,
}: IProps) {
  const [deleteProps, setDeleteProps] = useState<any>({
    open: false,
    promotion: null,
  });
  const [editProps, setEditProps] = useState<any>({
    open: false,
    promotion: null,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleDelete = async (targetPromotion: any) => {
    try {
      const response = await axios.delete(
        `${API_URL.ADMIN}/promotions?id=${targetPromotion?.id}`,
      );
      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }
      showNotification('success', 'Promotion deleted successfully');
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', error?.response?.data?.error || error);
    }
  };

  const handleUpdateStatus = async (
    e: any,
    id: number,
    status: PROMOTION_STATUS,
  ) => {
    e.stopPropagation();
    e.preventDefault();

    setIsLoading(true);
    try {
      const response = await axios.put(`${API_URL.ADMIN}/promotions`, {
        id,
        status,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', error?.response?.data?.error || error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleVisible = async (e: any, id: number) => {
    e.stopPropagation();
    e.preventDefault();

    setIsLoading(true);
    try {
      const response = await axios.put(
        `${API_URL.ADMIN}/promotions/toggle-visibility`,
        {
          id,
          visibility: e.target.checked,
        },
      );
      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }
      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', error?.response?.data?.error || error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <LoadingModal open={isLoading} />
      <DeleteModal
        open={deleteProps.open}
        handleCloseModal={() =>
          setDeleteProps({ open: false, promotion: null })
        }
        targetObj={deleteProps.promotion}
        showTargetObj={deleteProps?.promotion?.title}
        handleDelete={handleDelete}
      />
      {editProps.open && editProps.promotion && (
        <EditPromotion
          open={editProps.open}
          onClose={() => setEditProps({ open: false, promotion: null })}
          promotion={editProps.promotion}
          showNotification={showNotification}
        />
      )}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Visible</TableCell>
            <TableCell>Promotion</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Items</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {promotions.length > 0 &&
            promotions.map((promotion: any, index: number) => {
              return (
                <TableRow
                  key={index}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: grey[100] },
                  }}
                  onClick={() => {
                    setEditProps({
                      open: true,
                      promotion: promotion,
                    });
                  }}
                >
                  <TableCell>
                    <Switch
                      checked={promotion.visibility}
                      onClick={(e: any) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleToggleVisible(e, promotion.id);
                      }}
                    />
                  </TableCell>
                  <TableCell>{promotion.title}</TableCell>
                  <TableCell>
                    <Select
                      size="small"
                      value={promotion.status}
                      onChange={(e: any) =>
                        handleUpdateStatus(e, promotion.id, e.target.value)
                      }
                      onClick={(e: any) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                    >
                      <MenuItem value={PROMOTION_STATUS.ACTIVE}>
                        <StatusText
                          text={PROMOTION_STATUS.ACTIVE}
                          type="success"
                        />
                      </MenuItem>
                      <MenuItem value={PROMOTION_STATUS.INACTIVE}>
                        <StatusText
                          text={PROMOTION_STATUS.INACTIVE}
                          type="error"
                        />
                      </MenuItem>
                    </Select>
                    {/* {promotion.status} */}
                  </TableCell>
                  <TableCell>{promotion.items.length}</TableCell>
                  <TableCell>{promotion.createdAt}</TableCell>
                  <TableCell>
                    <Button
                      onClick={(e: any) => {
                        e.stopPropagation();
                        e.preventDefault();

                        setDeleteProps({ open: true, promotion: promotion });
                      }}
                      color="error"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </>
  );
}
