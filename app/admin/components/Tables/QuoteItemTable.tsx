import { generateImgUrl } from '@/app/lib/s3';
import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Trash2Icon } from 'lucide-react';
import { TextField, InputAdornment } from '@mui/material';

export default function QuoteItemTable({
  selectedItems,
  onUpdateItem, 
  onRemoveItem,
}: {
  selectedItems: any[];
  onUpdateItem: (item: any) => void;
  onRemoveItem: (item: any) => void;
}) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell colSpan={2}>Item</TableCell>
          <TableCell>Quoted Price</TableCell>
          <TableCell>Quantity</TableCell>
          <TableCell>Total</TableCell>
          <TableCell></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {selectedItems.map((item) => (
          <TableRow key={item.id}>
            <TableCell sx={{ width: 50 }}>
              {item.image && (
                <img
                  src={generateImgUrl(item.image)}
                  alt={item.name}
                  width={50}
                  height={50}
                  style={{ borderRadius: 4 }}
                />
              )}
            </TableCell>
            <TableCell>
              <Typography>{item.name}</Typography>
            </TableCell>
            <TableCell>
              <TextField
                value={item.price}
                fullWidth
                onChange={(e) =>
                  onUpdateItem({ ...item, price: e.target.value })
                }
                type="number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
              />
            </TableCell>
            <TableCell>
              <TextField
                value={item.quantity}
                fullWidth
                onChange={(e) =>
                  onUpdateItem({ ...item, quantity: e.target.value })
                }
                type="number"
              />
            </TableCell>
            <TableCell>${item.price * item.quantity}</TableCell>
            <TableCell>
              <IconButton onClick={() => onRemoveItem(item)}>
                <Trash2Icon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
