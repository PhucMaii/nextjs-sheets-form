import { getAdminApiUrl } from '@/app/utils/enum';
import { IInventoryUnit } from '@/app/utils/type';
import { Autocomplete, Box, CircularProgress, TextField } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useState } from 'react';

const useSelectUnit = (
  companyId: string,
  inventoryItemId: number,
  defaultUnit: IInventoryUnit | null = null,
) => {
  const [selectedUnit, setSelectedUnit] = useState<IInventoryUnit | null>(
    defaultUnit,
  );

  const { data: units, isLoading } = useQuery({
    queryKey: ['units', inventoryItemId],
    queryFn: async () => {
      const response = await axios.get(
        getAdminApiUrl(companyId, `/units?inventoryItemId=${inventoryItemId}`),
      );
      return response.data.data;
    },
    enabled: !!inventoryItemId && inventoryItemId > 0,
  });

  useEffect(() => {
    if (defaultUnit) {
      setSelectedUnit(defaultUnit);
    } else {
      if (units && units.length > 0) {
        setSelectedUnit(units[0]);
      }
    }
  }, [defaultUnit, units]);

  useEffect(() => {
    if (units && units.length > 0) {
      if (!selectedUnit) {
        setSelectedUnit(units[0]);
      }
    }
  }, [units, selectedUnit]);

  const renderSearchUnits = () => {
    if (isLoading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height={40}>
            <CircularProgress size={20} />
        </Box>
      )
    }
    return (
      <Autocomplete
        renderInput={(params) => <TextField {...params} label="Select Unit" />}
        options={units || []}
        getOptionLabel={(option) => `${option.unit} - ${option.ratio}`}
        onChange={(event, value) => setSelectedUnit(value)}
        value={selectedUnit}
      />
    );
  };

  return {
    renderSearchUnits,
    selectedUnit,
    setSelectedUnit,
    isLoading,
  };
};

export default useSelectUnit;
