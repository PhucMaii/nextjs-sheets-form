import React, { useCallback, useContext, useState } from 'react';
import SearchItem from '../components/Modals/SearchItem';
import OrderOnVacationModal from '../admin/components/Modals/OrderOnVacationModal';
import { Box, Grid, IconButton, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LoadingButton } from '@mui/lab';
import dayjs from 'dayjs';
import {
  disableChristmasAndNewYear,
  formatDateChanged,
  generateRecommendDate,
} from '../utils/time';
import ItemRow from '../components/SellingItemName';
import { FLAG_ORDER_TYPE } from '../utils/enum';
import { UserContext } from '../context/UserContextAPI';

export default function OldOrderVersion({
  itemList,
  setItemList,
  onSubmit,
  minDate,
}: any) {
  const { user: client } = useContext(UserContext);
  const [isOpenSearch, setIsOpenSearch] = useState<boolean>(false);
  const [unavailableRange, setUnavailableRange] = useState<Date[] | null>(null);
  const [isOrderOnVacationOpen, setIsOrderOnVacationOpen] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [note, setNote] = useState<string>('');
  const [deliveryDate, setDeliveryDate] = useState<string>(() =>
    generateRecommendDate(),
  );

  const onChangeItem = useCallback((e: any, targetItem: any) => {
    setItemList((prevList: any[]) =>
      prevList.map((item: any) => {
        if (item.id === targetItem.id) {
          return { ...targetItem, quantity: +e.target.value };
        }
        return item;
      }),
    );
  }, []);
  const onDateChange = (e: any) => {
    const formattedDate = formatDateChanged(e);
    setDeliveryDate(formattedDate);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const items = itemList.filter((item: any) => item.quantity > 0);
    const response = await onSubmit({ deliveryDate, note, items });

    if (
      response &&
      response.data.warning &&
      response.data.flag === FLAG_ORDER_TYPE.VACATION_ORDER
    ) {
      setIsOrderOnVacationOpen(true);
      setUnavailableRange(response.data.data.unavailableRange);
    }
    setIsLoading(false);
  };
  return (
    <>
      <SearchItem
        open={isOpenSearch}
        onClose={() => setIsOpenSearch(false)}
        items={itemList}
        setItems={setItemList}
      />

      {unavailableRange && (
        <OrderOnVacationModal
          clientName={client?.clientName || ''}
          open={isOrderOnVacationOpen}
          onClose={() => setIsOrderOnVacationOpen(false)}
          startDate={new Date(unavailableRange[0])}
          endDate={new Date(unavailableRange[1])}
          handleContinueOrder={(e: any) => onSubmit(e, false)}
        />
      )}
      <div className="w-full mx-auto pb-6">
        {/* <form className="relative bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 overflow-scroll"> */}
        <Box
          sx={{ position: 'relative', backgroundColor: 'white' }}
          borderRadius={2}
          px={4}
          py={2}
        >
          {/* <h4 className="text-center font-bold text-4xl px-8 mb-8">
              {clientName}
            </h4> */}
          <Grid container alignItems="center" rowGap={2} mb={2}>
            <Grid item xs={2}></Grid>
            <Grid item xs={8}>
              <Typography variant="h4" textAlign="center">
                {client?.clientName || ''}
              </Typography>
            </Grid>
            <Grid item xs={2} textAlign="right">
              <IconButton size="large" onClick={() => setIsOpenSearch(true)}>
                <SearchIcon fontSize="large" />
              </IconButton>
            </Grid>
          </Grid>
          <Box mb={4}>
            <Typography fontWeight="bold" variant="subtitle1" color="error">
              DELIVERY DATE
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                disablePast
                minDate={minDate}
                value={dayjs(deliveryDate)}
                onChange={onDateChange}
                sx={{ width: '100%' }}
                shouldDisableDate={disableChristmasAndNewYear}
              />
            </LocalizationProvider>
          </Box>
          <Box display="flex" flexDirection="column" gap={4}>
            {itemList.length > 0 &&
              itemList.map((item: any) => {
                return (
                  <ItemRow
                    key={item.id}
                    item={item}
                    onChangeItem={onChangeItem}
                    setItemList={setItemList}
                  />
                );
              })}
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="subtitle1">NOTE</Typography>
              <TextField
                multiline
                maxRows={4}
                value={note}
                className="border-neutral-400 h-full mb-4"
                onChange={(e) => setNote(e.target.value)}
                placeholder="Writing your note here..."
              />
            </Box>
          </Box>

          <Box display="flex" justifyContent={'center'}>
            <LoadingButton
              variant="contained"
              onClick={handleSubmit}
              type="submit"
              loading={isLoading}
              fullWidth
              // sx={{ mt: 2}}
            >
              Submit
            </LoadingButton>
          </Box>
          {/* </form> */}
        </Box>
      </div>
    </>
  );
}
