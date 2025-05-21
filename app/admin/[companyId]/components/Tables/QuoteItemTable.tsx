import { Grid } from '@mui/material';
import { memo } from 'react';
import QuoteItemRow from '../QuoteItemRow';

const QuoteItemTable = ({
  selectedItems,
  onUpdateItem,
  onRemoveItem,
}: {
  selectedItems: any[];
  onUpdateItem: (item: any) => void;
  onRemoveItem: (item: any) => void;
}) => {
  return (
    <Grid container spacing={2}>
      {selectedItems.map((item) => (
        <QuoteItemRow
          key={item.id}
          item={item}
          onUpdateItem={onUpdateItem}
          onRemoveItem={onRemoveItem}
        />
        // <Fragment key={item.id}>
        //   <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        //     {item?.image && (
        //       <img
        //         src={generateImgUrl(item.image)}
        //         alt={item.name}
        //         width={50}
        //         height={50}
        //         style={{ borderRadius: 4 }}
        //       />
        //     )}
        //     <Typography sx={{ fontWeight: 'semibold' }}>{item.name}</Typography>
        //   </Grid>
        //   <Grid item xs={12}>
        //     <UnitRadio
        //       value={JSON.stringify(item?.unit)}
        //       units={item.units}
        //       onChange={(e: any) =>
        //         onUpdateItem({ ...item, unit: JSON.parse(e.target.value) })
        //       }
        //     />
        //   </Grid>

        //   <Grid item xs={5}>
        //     <TextField
        //       value={item.price}
        //       fullWidth
        //       onChange={(e) => onUpdateItem({ ...item, price: e.target.value })}
        //       type="number"
        //       InputProps={{
        //         startAdornment: (
        //           <InputAdornment position="start">$</InputAdornment>
        //         ),
        //       }}
        //     />
        //   </Grid>

        //   <Grid item xs={5}>
        //     <TextField
        //       value={item.quantity}
        //       fullWidth
        //       onChange={(e) =>
        //         onUpdateItem({ ...item, quantity: e.target.value })
        //       }
        //     />
        //   </Grid>

        //   <Grid
        //     item
        //     xs={2}
        //     sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        //   >
        //     <Typography sx={{ fontWeight: 'semibold' }}>${item.price * item.quantity}</Typography>
        //     <IconButton size="small" onClick={() => onRemoveItem(item)}>
        //       <Trash2Icon style={{ width: 16, height: 16 }} />
        //     </IconButton>
        //   </Grid>
        //   <Grid item xs={12}>
        //     <Divider />
        //   </Grid>
        // </Fragment>
      ))}
    </Grid>
  );
};

export default memo(QuoteItemTable, (prevProps, nextProps) => {
  return (
    Object.is(prevProps.selectedItems, nextProps.selectedItems) &&
    Object.is(prevProps.onUpdateItem, nextProps.onUpdateItem) &&
    Object.is(prevProps.onRemoveItem, nextProps.onRemoveItem)
  );
});
