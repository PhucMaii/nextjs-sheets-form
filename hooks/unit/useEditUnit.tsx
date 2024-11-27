import { IInventoryUnit } from '@/app/utils/type';
import { AlertColor } from '@mui/material';
import { useState } from 'react';
import { useMultipleBoolean } from '../useMultipleBoolean';
import AddUnit from '@/app/admin/components/Modals/add/AddUnit';
import EditUnit from '@/app/admin/components/Modals/edit/EditUnit';

const useEditUnit = (
  initialUnits: IInventoryUnit[] = [],
  showNotification: (type: AlertColor, message: string) => void,
) => {
  const [units, setUnits] = useState<IInventoryUnit[]>(initialUnits);
  const [editUnit, setEditUnit] = useState<any>({
    open: false,
    unit: null,
    unitIndex: -1,
  });
  const [addUnitBoolean, onChangeAddUnitBoolean] = useMultipleBoolean({
    open: false,
    disabledClose: false,
  });

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

    // if (promptedItem.unit.ratio === removedUnit.ratio && promptedItem.unit.unit === removedUnit.unit) {
    //   setPromptedItem({
    //     ...promptedItem,
    //     units: newUnits,
    //     unit: newUnits[0],
    //   });
    // } else {
    //   setPromptedItem({
    //     ...promptedItem,
    //     units: newUnits,
    //   })
    // }
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

    setUnits(newUnits);

    // setPromptedItem({
    //   ...promptedItem,
    //   units: newUnits,
    //   unit: updatedUnit
    // });
  };

  const AddUnitModal = () => {
    return (
      <AddUnit
        open={addUnitBoolean.open}
        onClose={() => onChangeAddUnitBoolean('open', false)}
        addUnit={addUnit}
        noClose={addUnitBoolean.disabledClose}
      />
    );
  };

  const EditUnitModal = () => {
    return (
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
  };
  return {
    units,
    addUnit,
    removeUnit,
    updateUnit,
    AddUnitModal,
    EditUnitModal,
  };
};

export default useEditUnit;
