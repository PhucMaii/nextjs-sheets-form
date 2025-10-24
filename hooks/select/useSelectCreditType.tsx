import { CreditType } from '@prisma/client';
import { useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';

const useSelectCreditType = () => {
  const [selectedCreditType, setSelectedCreditType] = useState<CreditType>(
    CreditType.QUALITY_ISSUE,
  );

  const renderCreditTypeSearch = () => {
    return (
      <Autocomplete
        options={[
          CreditType.QUALITY_ISSUE,
          CreditType.PRICING_ERROR,
          CreditType.CUSTOMER_SATISFACTION,
          CreditType.SERVICE_ISSUE,
          CreditType.DELIVERY_ISSUE,
        ]}
        getOptionLabel={(option: CreditType) => option}
        renderInput={(params) => (
          <TextField {...params} label="Select Credit Type" />
        )}
        value={selectedCreditType}
        onChange={(e: any, value: any) => setSelectedCreditType(value)}
      />
    );
  };

  return {
    selectedCreditType,
    renderCreditTypeSearch,
  };
};

export default useSelectCreditType;