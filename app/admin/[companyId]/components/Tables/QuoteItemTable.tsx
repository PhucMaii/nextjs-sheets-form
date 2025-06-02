import { Grid } from '@mui/material';
import { memo } from 'react';
import QuoteItemRow from '../QuoteItemRow';

interface QuoteItem {
  id: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  unit: any;
  units: any[];
}

interface QuoteItemTableProps {
  selectedItems: QuoteItem[];
  onUpdateItem: (item: QuoteItem) => void;
  onRemoveItem: (item: QuoteItem) => void;
}

const QuoteItemTable = ({
  selectedItems,
  onUpdateItem,
  onRemoveItem,
}: QuoteItemTableProps) => {
  if (!selectedItems || selectedItems.length === 0) {
    return null;
  }

  return (
    <Grid container spacing={2}>
      {selectedItems.map((item) => (
        <QuoteItemRow
          key={item.id}
          item={item}
          onUpdateItem={onUpdateItem}
          onRemoveItem={onRemoveItem}
        />
      ))}
    </Grid>
  );
};

export default memo(QuoteItemTable, (prevProps, nextProps) => {
  if (prevProps.selectedItems.length !== nextProps.selectedItems.length) {
    return false;
  }

  return (
    prevProps.selectedItems.every((item, index) => {
      const nextItem = nextProps.selectedItems[index];
      return (
        item.id === nextItem.id &&
        item.price === nextItem.price &&
        item.quantity === nextItem.quantity &&
        JSON.stringify(item.unit) === JSON.stringify(nextItem.unit)
      );
    }) &&
    prevProps.onUpdateItem === nextProps.onUpdateItem &&
    prevProps.onRemoveItem === nextProps.onRemoveItem
  );
});
