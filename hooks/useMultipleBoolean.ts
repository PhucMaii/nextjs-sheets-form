import { useState } from 'react';

export const useMultipleBoolean = (booleanValues: any) => {
  const [booleanState, setBooleanState] = useState<any>(booleanValues);

  const onChangeBooleanValue = (field: string, value: boolean) => {
    setBooleanState({ ...booleanState, [field]: value });
  };

  return [booleanState, onChangeBooleanValue];
};
