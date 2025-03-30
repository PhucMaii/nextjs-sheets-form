import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import React, { useEffect } from 'react';
import { IItem, IOption } from '../utils/type';

export default function SellingItemName({
  item,
  selectedOption,
  // setSelectedOption,
  onSelectOption
}: {
  item: IItem;
  selectedOption: number | null;
  onSelectOption: any;

}) {
  // console.log(item, 'item');
  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <Box display="flex" gap={1}>
        <Typography
          sx={{ color: item.availability ? 'black' : grey[500] }}
          fontWeight="bold"
          variant="subtitle1"
        >
          {`${item.name} - `}
        </Typography>
        {item?.isShowDiscount && item?.prevPrice && (
          <Typography
            fontWeight="bold"
            variant="subtitle1"
            sx={{ textDecoration: 'line-through' }}
            color="error"
          >
            {`$${item?.prevPrice?.toFixed(2)}`}
          </Typography>
        )}
        <Typography
          sx={{ color: item.availability ? 'black' : grey[500] }}
          fontWeight="bold"
          variant="subtitle1"
        >
          {`${
            !item.availability
              ? 'Out of stock'
              : item.price === 0
                ? ' Variable price'
                : `$${item?.price?.toFixed(2)}`
          }`}
        </Typography>
      </Box>

      {item?.options && item?.options.length > 0 && (
        <FormControl>
          <FormLabel id="option-label">Options</FormLabel>
          <RadioGroup
            row
            aria-labelledby="option-label"
            value={selectedOption}
            onChange={(e) => onSelectOption(e)}
          >
            {item.options.map((option: any) => (
              <FormControlLabel
                key={option.id}
                value={option.id}
                control={<Radio />}
                label={`${option.name} - $${option.price?.toFixed(2)}`}
              />
            ))}
          </RadioGroup>
        </FormControl>
      )}
    </Box>
  );
}

export const ItemRow = ({
  item,
  onChangeItem,
  itemList,
  setItemList,
}: {
  item: IItem;
  onChangeItem: any;
  itemList: any;
  setItemList: any;
}) => {
  const [selectedOption, setSelectedOption] = React.useState<number | null>(
    null,
  );

  useEffect(() => {
    if (item?.options && item?.options.length > 0) {
      setSelectedOption(item?.options[0]?.id || null);
    }
  }, [item]);

  const onSelectOption = (e: any) => {
    const newItems = itemList.map((i: any) => {
      const itemOption = i?.options?.find(
        (option: any) => option.id === +e.target.value,
      )
      if (i.id === item.id) {
          return {
            ...i,
            price: itemOption?.price,
            inventoryUnit: itemOption?.unit,
            inventoryUnitId: itemOption?.unitId,
            prevPrice: itemOption?.prevPrice || i?.prevPrice,
            isShowDiscount:
              itemOption?.isShowDiscount || i?.isShowDiscount || false,
            option: {
              name: itemOption?.name,
              price: itemOption?.price,
              ratio: itemOption?.unit?.ratio,
            },
          };
      }
      return i;
    });

    setSelectedOption(+e.target.value);
    setItemList(newItems);
  };

  // useEffect(() => {
  //   if (selectedOption && item?.options) {
  //     const newItems = itemList.map((i: any) => {
  //       if (i.id === item.id) {
  //         const itemOption = i?.options?.find(
  //           (option: any) => option.id === selectedOption,
  //         );

  //         return {
  //           ...i,
  //           price: itemOption?.price,
  //           inventoryUnit: itemOption?.unit,
  //           inventoryUnitId: itemOption?.unitId,
  //           prevPrice: itemOption?.prevPrice || i?.prevPrice,
  //           isShowDiscount:
  //             itemOption?.isShowDiscount || i?.isShowDiscount || false,
  //           option: {
  //             name: itemOption?.name,
  //             price: itemOption?.price,
  //             ratio: itemOption?.unit?.ratio,
  //           },
  //         };
  //       }

  //       return item;
  //     });
  //     setItemList(newItems);
  //   }
  // }, [selectedOption]);

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <SellingItemName
        item={item}
        selectedOption={selectedOption}
        // setSelectedOption={setSelectedOption}
        onSelectOption={onSelectOption}
      />
      <TextField
        type="number"
        value={item.quantity}
        onChange={(e) => onChangeItem(e, item)}
        placeholder={`Enter ${item.name} here...`}
        disabled={!item.availability}
        inputProps={{ min: 0 }}
      />
    </Box>
  );
};
