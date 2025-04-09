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
import React, { memo, useEffect } from 'react';
import { IItem } from '../utils/type';

function SellingItemName({
  item,
  // selectedOption,
  // setSelectedOption,
  onSelectOption,
}: {
  item: IItem | any;
  // selectedOption: number | null;
  onSelectOption: any;
}) {
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
            value={item?.optionId || -1}
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

const ItemRow = ({
  item,
  onChangeItem,
  setItemList,
}: {
  item: IItem | any;
  onChangeItem: any;
  // itemList: any;
  setItemList: any;
}) => {
  // const [selectedOption, setSelectedOption] = React.useState<number | null>(
  //   null,
  // );

  console.log('re render item row');
  useEffect(() => {
    if (item?.options && item?.options.length > 0) {
      // setSelectedOption(item?.options[0]?.id || null);

      const itemOption = item?.options[0];
      // Set the default option id is the first option
      setItemList((prevList: any) => {
        const newList = prevList.map((i: any) => {
          if (i.id === item.id) {
            return {
              ...i,
              price: itemOption?.price,
              inventoryUnit: itemOption?.unit,
              inventoryUnitId: itemOption?.unitId,
              prevPrice: itemOption?.prevPrice || i?.prevPrice,
              optionId: itemOption?.id,
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

        return newList;
      });
    }
  }, [item.name]);

  // const onSelectOption = useCallback(
  //   () => (e: any) => {

  //     // setSelectedOption(+e.target.value);
  //     setItemList((prevList: any) => {
  //       const newItems = prevList.map((i: any) => {
  //         const itemOption = i?.options?.find(
  //           (option: any) => option.id === +e.target.value,
  //         );
  //         // console.log({options: i?.options, itemOption}, 'itemOption');
  //         if (i.id === item.id && itemOption) {
  //           return {
  //             ...i,
  //             price: itemOption?.price,
  //             inventoryUnit: itemOption?.unit,
  //             inventoryUnitId: itemOption?.unitId,
  //             prevPrice: itemOption?.prevPrice || i?.prevPrice,
  //             optionId: itemOption?.id,
  //             isShowDiscount:
  //               itemOption?.isShowDiscount || i?.isShowDiscount || false,
  //             option: {
  //               name: itemOption?.name,
  //               price: itemOption?.price,
  //               ratio: itemOption?.unit?.ratio,
  //             },
  //           };
  //         }
  //         return i;
  //       });

  //       return newItems;
  //     });
  //   },

  //   [],
  // );

  const onSelectOption = (e: any) => {
    setItemList((prevList: any) => {
      const newItems = prevList.map((i: any) => {
        const itemOption = i?.options?.find(
          (option: any) => option.id === +e.target.value,
        );
        // console.log({options: i?.options, itemOption}, 'itemOption');
        if (i.id === item.id && itemOption) {
          return {
            ...i,
            price: itemOption?.price,
            inventoryUnit: itemOption?.unit,
            inventoryUnitId: itemOption?.unitId,
            prevPrice: itemOption?.prevPrice,
            optionId: itemOption?.id,
            isShowDiscount: itemOption?.isShowDiscount || false,
            option: {
              name: itemOption?.name,
              price: itemOption?.price,
              ratio: itemOption?.unit?.ratio,
            },
          };
        }
        return i;
      });

      return newItems;
    });
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
        // selectedOption={selectedOption}
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

export default memo(ItemRow, (prev, next) => {
  return (
    Object.is(prev.item, next.item) &&
    Object.is(prev.setItemList, next.setItemList) &&
    Object.is(prev.onChangeItem, next.onChangeItem)
  );
});
