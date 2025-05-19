import {
  AlertColor,
  Box,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import { Cheque } from '@prisma/client';
import FileUpload from '../../FileUpload';
import { days, months } from '@/app/lib/constant';
import { UserType } from '@/app/utils/type';
import { LoadingButton } from '@mui/lab';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import DeleteModal from '../delete/DeleteModal';
import DisplayFile from '../DisplayFile';
import { useParams } from 'next/navigation';

interface IProps extends ModalProps {
  cheque: Cheque;
  client: UserType | null;
  showNotification: (color: AlertColor, message: string) => void;
}

export default function EditCheque({
  open,
  onClose,
  cheque,
  showNotification,
  client,
}: IProps) {
  const { companyId }: any = useParams();

  const [deleteModalProps, setDeleteModalProps] = useState<any>({
    open: false,
    cheque: null,
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [updatedCheque, setUpdatedCheque] = useState<Cheque>({
    ...cheque,
  });

  const month = days[new Date().getMonth()];
  const year = new Date().getFullYear();

  useEffect(() => {
    setUpdatedCheque({
      ...cheque,
    });
  }, [cheque]);

  const handleSaveCheque = async () => {
    setIsSaving(true);
    try {
      const response = await axios.put(getAdminApiUrl(companyId, '/cheque'), {
        updatedCheque,
        id: cheque.id,
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
      setIsSaving(false);
    }
  };

  const handleDeleteCheque = async (deletedCheque: any) => {
    try {
      const response = await axios.delete(
        `${getAdminApiUrl(companyId, `/cheque?id=${deletedCheque.id}`)}`,
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', error?.response?.data?.error || error);
    }
  };

  return (
    <>
      <DeleteModal
        open={deleteModalProps.open}
        handleCloseModal={() =>
          setDeleteModalProps({ open: false, cheque: null })
        }
        targetObj={deleteModalProps.cheque}
        handleDelete={handleDeleteCheque}
        showTargetObj={updatedCheque?.chequeNumber || ''}
      />
      <Modal open={open} onClose={onClose}>
        <BoxModal maxHeight="80vh" overflow="scroll">
          <ModalHead
            heading="Edit Cheque"
            buttonLabel="EDIT"
            onClick={handleSaveCheque}
            buttonProps={{ loading: isSaving }}
            onClose={onClose}
          />

          <Divider sx={{ my: 2 }} />

          <Box display="flex" flexDirection="column" gap={2} mb={2}>
            <Typography>Front of cheque</Typography>
            {updatedCheque?.fileKeyFront && (
              <DisplayFile fileKey={updatedCheque.fileKeyFront} isCheque />
            )}
            <FileUpload
              showNotification={showNotification}
              fileName={`${month}-${year}-${client?.clientId}_front`}
              uploadLocation={`cheques/${year}/${month}`}
              onUploadImageUI={(fileKey: string) => {
                setUpdatedCheque({
                  ...updatedCheque,
                  fileKeyFront: fileKey,
                });
              }}
              isCheque
            />

            <Typography>Back of cheque</Typography>
            {updatedCheque?.fileKeyBack && (
              <DisplayFile fileKey={updatedCheque.fileKeyBack} isCheque />
            )}
            <FileUpload
              showNotification={showNotification}
              fileName={`${month}-${year}-${client?.clientId}_back`}
              uploadLocation={`cheques/${year}/${month}`}
              onUploadImageUI={(fileKey: string) => {
                setUpdatedCheque({
                  ...updatedCheque,
                  fileKeyBack: fileKey,
                });
              }}
              isCheque
            />

            <Typography variant="h6" fontWeight="regular">
              Cheque Number
            </Typography>
            <TextField
              placeholder="Cheque Number"
              variant="outlined"
              size="small"
              value={updatedCheque.chequeNumber}
              onChange={(e) => {
                setUpdatedCheque({
                  ...updatedCheque,
                  chequeNumber: e.target.value,
                });
              }}
            />

            <Typography variant="h6" fontWeight="regular">
              Amount ($)
            </Typography>
            <TextField
              placeholder="Amount ($)"
              variant="outlined"
              size="small"
              type="number"
              value={updatedCheque.amount}
              onChange={(e) => {
                setUpdatedCheque({
                  ...updatedCheque,
                  amount: +e.target.value,
                });
              }}
            />

            <Typography variant="h6" fontWeight="regular">
              For:
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={6}>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel id="month-label">Month</InputLabel>
                  <Select
                    labelId="month-label"
                    label="Month"
                    placeholder="Month"
                    fullWidth
                    value={updatedCheque.month}
                    onChange={(e) => {
                      setUpdatedCheque({
                        ...updatedCheque,
                        month: e.target.value,
                      });
                    }}
                  >
                    {months.map((month) => (
                      <MenuItem key={month} value={month}>
                        {month}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  placeholder="Year"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={updatedCheque.year}
                  onChange={(e) => {
                    setUpdatedCheque({
                      ...updatedCheque,
                      year: e.target.value,
                    });
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          <LoadingButton
            color="error"
            variant="outlined"
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => {
              setDeleteModalProps({
                open: true,
                cheque: updatedCheque,
              });
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <DeleteIcon />
              <Typography>Delete Cheque</Typography>
            </Box>
          </LoadingButton>
        </BoxModal>
      </Modal>
    </>
  );
}
