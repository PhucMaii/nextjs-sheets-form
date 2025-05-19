import { Box, Modal, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import { IOption } from '@/app/utils/type';
import { grey } from '@mui/material/colors';
import { SWRFetchData } from '@/app/utils/db';
import { getAdminApiUrl } from '@/app/utils/enum';
import { Trash2Icon } from 'lucide-react';
import { ShowNotificationType } from '@/hooks/useNotification';
import axios from 'axios';
import { LoadingButton } from '@mui/lab';
import RelevantPreOrdersTable from '../../Tables/RelevantPreOrdersTable';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import { useParams } from 'next/navigation';

interface IProps extends ModalProps {
  option: IOption;
  allOptions: IOption[];
  showNotification: ShowNotificationType;
  setItems?: any;
}

export default function DeleteOption({
  open,
  onClose,
  option,
  allOptions,
  showNotification,
  setItems,
}: IProps) {
  const { companyId }: any = useParams();
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [relevantItemPreOrders, setRelevantItemPreOrders] = useState<any>([]);
  const [selectedOption, setSelectedOption] = useState<IOption | null>(null);

  const otherOptions = useMemo(() => {
    return allOptions.filter((o) => o.id !== option.id);
  }, [allOptions]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [itemInPreOrders, mutate, isValidating] = SWRFetchData(
    `${getAdminApiUrl(companyId, `/scheduledOrders/by-option?optionName=${option?.name}&categoryId=${option?.item?.categoryId}&itemName=${option?.item?.name}`)}`,
  );

  console.log(option, 'option');

  useEffect(() => {
    if (otherOptions && otherOptions.length > 0) {
      setSelectedOption(otherOptions[0]);
    }
  }, [otherOptions]);

  useEffect(() => {
    if (itemInPreOrders) {
      setIsInitializing(false);
      setRelevantItemPreOrders(itemInPreOrders?.data);
    }
  }, [itemInPreOrders]);

  const renderWarningText = useCallback(() => {
    if (otherOptions.length === 0) {
      return (
        <Typography variant="subtitle1" sx={{ color: grey[500] }}>
          WARNING: Please acknowledge that all pre order items price relevant to
          this option will be reset to base item price.
        </Typography>
      );
    }

    return (
      <Typography variant="subtitle1" sx={{ color: grey[500] }}>
        WARNING: There are {relevantItemPreOrders?.length || 0} pre orders has
        item included this `{option?.name}` option. <br /> Please acknowledge
        that the selected option will be applied on those pre order items.
      </Typography>
    );
  }, [otherOptions, relevantItemPreOrders]);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await axios.delete(
        `${getAdminApiUrl(companyId, `/options?id=${option?.id}&newOptionId=${selectedOption?.id}`)}`,
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      if (setItems) {
        const deletedOptionItem = response.data.data;
        setItems((prevItems: any) => {
          return prevItems.map((item: any) => {
            if (item.id === deletedOptionItem?.id) {
              return deletedOptionItem;
            } else {
              return item;
            }
          });
        });
      }
      showNotification('success', response.data.message);
      onClose();
    } catch (error: any) {
      console.log('Fail to delete option: ' + error);
      showNotification('error', 'Fail to delete option: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal display="flex" flexDirection="column" gap={1}>
        {isInitializing ? (
          <LoadingComponent />
        ) : (
          <>
            <Typography variant="h6" fontWeight="regular">
              Delete <strong>{option?.name}</strong> Option
            </Typography>

            {renderWarningText()}

            {/* Display list of other options to choose */}
            {otherOptions.length > 0 && (
              <Box display="flex" gap={2} alignItems="center">
                {otherOptions.map((o) => (
                  <Box
                    key={o?.id}
                    // variant="body1"
                    display="flex"
                    sx={{
                      cursor: 'pointer',
                      height: 50,
                      width: 'fit-content',
                      px: 4,
                      py: 2,
                      backgroundColor: grey[200],
                      borderRadius: 2,
                      border:
                        selectedOption?.id === o?.id ? '2px solid red' : '',
                    }}
                    onClick={() => setSelectedOption(o)}
                    // justifyContent="center"
                    // alignItems="center"
                  >
                    <Typography variant="body1" sx={{ fontWeight: 'semibold' }}>
                      {o?.name}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}

            <Typography variant="h6" mt={2} fontWeight="regular">
              Relevant Pre Orders
            </Typography>

            <RelevantPreOrdersTable
              relevantItemPreOrders={relevantItemPreOrders}
            />
          </>
        )}

        <LoadingButton
          fullWidth
          variant="contained"
          color="error"
          loading={isLoading}
          onClick={handleDelete}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Trash2Icon />
            <Typography>Delete</Typography>
          </Box>
        </LoadingButton>
      </BoxModal>
    </Modal>
  );
}
