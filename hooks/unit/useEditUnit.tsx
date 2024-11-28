import { IInventoryUnit } from '@/app/utils/type';
import {
  AlertColor,
  Box,
  FormControl,
  FormLabel,
  IconButton,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useMultipleBoolean } from '../useMultipleBoolean';
import AddUnit from '@/app/admin/components/Modals/add/AddUnit';
import EditUnit from '@/app/admin/components/Modals/edit/EditUnit';
import UnitRadio from '@/app/admin/components/Radio/UnitRadio';
import AddIcon from '@mui/icons-material/Add';

const useEditUnit = (
  initialUnits: IInventoryUnit[] = [],
  initialSelectedUnit: IInventoryUnit | null = null,
  showNotification: (type: AlertColor, message: string) => void,
  isShowPrice: boolean = false,
) => {
  const [addUnitBoolean, onChangeAddUnitBoolean] = useMultipleBoolean({
    open: false,
    disabledClose: false,
  });
  const [editUnit, setEditUnit] = useState<any>({
    open: false,
    unit: null,
    unitIndex: -1,
  });
  const [selectedUnit, setSelectedUnit] = useState<IInventoryUnit | null>(
    initialSelectedUnit,
  );
  const [units, setUnits] = useState<IInventoryUnit[]>(initialUnits);

  useEffect(() => {
    setUnits(initialUnits);
  }, [initialUnits]);

  const addUnit = (newUnit: IInventoryUnit) => {
    if (units.length === 0) {
      if (newUnit.ratio !== 1) {
        showNotification('error', 'New Item Required Ratio of 1');
        return;
      }
    }

    const unitRatioExist = units?.find((unit: any) => {
      return newUnit.ratio === unit.ratio;
    });

    if (unitRatioExist) {
      showNotification('error', 'Unit ratio already exists');
      return;
    }

    const unitNameExist = units?.find((unit: any) => {
      return newUnit.unit === unit.unit;
    });

    if (unitNameExist) {
      showNotification('error', 'Unit name already exists');
      return;
    }

    onChangeAddUnitBoolean('open', false);

    setUnits([...units, newUnit]);
    setSelectedUnit(newUnit);

    return newUnit;

    // setPromptedItem({
    //   ...promptedItem,
    //   units: [...(promptedItem?.units || []), newUnit],
    //   unit: newUnit
    // });
  };

  const removeUnit = (removedUnit: any) => {
    if (removedUnit.ratio === 1) {
      showNotification('error', 'Inventory Item Required Ratio of 1');
      return;
    }

    const newUnits = units?.filter((item: any) => {
      return removedUnit.unit !== item.unit && removedUnit.ratio !== item.ratio;
    });

    setUnits(newUnits);

    if (selectedUnit) {
      if (
        selectedUnit?.ratio === removedUnit.ratio &&
        selectedUnit?.unit === removedUnit.unit
      ) {
        setSelectedUnit(units[0]);
      }
    }
  };

  const updateUnit = (updatedUnit: any, updatedIndex: number) => {
    if (units?.length === 1) {
      if (updatedUnit.ratio !== 1) {
        showNotification('error', 'Inventory Item Required Ratio of 1');
        return;
      }
    }

    const unitRatioExist = units?.find((unit: any, index: number) => {
      return updatedUnit.ratio === unit.ratio && index !== updatedIndex;
    });

    if (unitRatioExist) {
      showNotification('error', 'Unit ratio already exists');
      return;
    }

    const unitNameExist = units?.find((unit: any, index: number) => {
      return updatedUnit.unit === unit.unit && index !== updatedIndex;
    });

    if (unitNameExist) {
      showNotification('error', 'Unit name already exists');
      return;
    }

    const newUnits = units?.map((unit: any, index: number) => {
      if (index === updatedIndex) {
        return updatedUnit;
      }

      return unit;
    });

    setEditUnit({
      unit: null,
      open: false,
    });
    
    setSelectedUnit(updatedUnit);
    setUnits(newUnits);

    // setPromptedItem({
    //   ...promptedItem,
    //   units: newUnits,
    //   unit: updatedUnit
    // });
  };

  const AddUnitModal = (
    <AddUnit
      open={addUnitBoolean.open}
      onClose={() => onChangeAddUnitBoolean('open', false)}
      addUnit={addUnit}
      noClose={addUnitBoolean.disabledClose}
    />
  );

  const EditUnitModal = (
    <EditUnit
      open={editUnit.open}
      onClose={() =>
        setEditUnit((prevEditUnit: any) => ({ ...prevEditUnit, open: false }))
      }
      unit={editUnit.unit}
      updateUnit={(updatedUnit: any) =>
        updateUnit(updatedUnit, editUnit.unitIndex)
      }
    />
  );

  const UnitDisplay = (
    <FormControl>
      <Box display="flex" alignItems="center" gap={1}>
        <FormLabel id="unit">Units</FormLabel>
        <IconButton onClick={() => onChangeAddUnitBoolean('open', true)}>
          <AddIcon />
        </IconButton>
      </Box>
      <UnitRadio
        units={units}
        onChange={(e: any) => setSelectedUnit(JSON.parse(e.target.value))}
        value={JSON.stringify(selectedUnit)}
        removeUnit={removeUnit}
        setEditUnit={setEditUnit}
        isShowPrice={isShowPrice}
      />
    </FormControl>
  );

  return {
    units,
    addUnit,
    removeUnit,
    updateUnit,
    AddUnitModal,
    EditUnitModal,
    UnitDisplay,
    selectedUnit,
    onChangeAddUnitBoolean,
  };
};

export default useEditUnit;
