import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
} from '@mui/material';
import { Package } from 'lucide-react';
import { IInventoryCount, IInventoryItem } from '@/app/utils/type';
import useSelectUnit from '@/hooks/select/useSelectUnit';
import { useParams } from 'next/navigation';

interface IProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (isDialogOpen: boolean) => void;
  selectedItem: IInventoryItem | null;
  setSelectedItem: (selectedItem: IInventoryItem | null) => void;
  handleSaveCount: (countInput: number, selectedUnit: any) => void;
  currentReportItems: IInventoryCount[];
}

export default function CountInputDialog({
  isDialogOpen,
  setIsDialogOpen,
  selectedItem,
  setSelectedItem,
  handleSaveCount,
  currentReportItems,
}: IProps) {
  const { companyId }: any = useParams();
  const [countInput, setCountInput] = useState<number>(0);

  const { renderSearchUnits, selectedUnit } = useSelectUnit(
    companyId,
    selectedItem?.id || 0,
  );

  useEffect(() => {
    if (
      currentReportItems.find(
        (item) => item.inventoryItemId === selectedItem?.id,
      )
    ) {
      setCountInput(
        currentReportItems.find(
          (item) => item.inventoryItemId === selectedItem?.id,
        )?.countedQty || 0,
      );
    } else {
      setCountInput(0);
    }
  }, [currentReportItems, selectedItem]);

  return (
    <Dialog
      open={isDialogOpen}
      onClose={() => {
        setIsDialogOpen(false);
        setSelectedItem(null);
        setCountInput(0);
      }}
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxWidth: '90vw',
          width: 500,
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Package size={24} color="#3B82F6" />
          <Typography variant="h6" fontWeight={600}>
            Enter Count
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <Typography variant="body1" fontWeight={600}>
            {selectedItem?.name}
          </Typography>
          {selectedItem?.sku && (
            <Typography variant="caption" color="text.secondary">
              SKU: {selectedItem.sku}
            </Typography>
          )}
          <Box display="flex" gap={2}>
            <TextField
              fullWidth
              sx={{ flex: 2 }}
              label="Count"
              type="number"
              value={countInput}
              onChange={(e) => setCountInput(+e.target.value)}
              InputProps={{
                inputProps: { min: 0 },
              }}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveCount(countInput, selectedUnit);
                }
              }}
            />
            <Box sx={{ flex: 1 }}>{renderSearchUnits()}</Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button
          onClick={() => {
            setIsDialogOpen(false);
            setSelectedItem(null);
            setCountInput(0);
          }}
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => handleSaveCount(countInput, selectedUnit)}
          variant="contained"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            bgcolor: '#3B82F6',
            '&:hover': { bgcolor: '#2563EB' },
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
