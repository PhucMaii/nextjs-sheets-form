import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getAdminApiUrl } from "@/app/utils/enum";
import { Autocomplete, TextField } from "@mui/material";

const useSelectExpenseType = (companyId: string, defaultValue?: any) => {
    const [selectedExpenseType, setSelectedExpenseType] = useState<any>({ id: -1, name: '-- N/A --' });

    useEffect(() => {
        if (defaultValue) {
            setSelectedExpenseType({ id: defaultValue.id, name: defaultValue.name });
        }
    }, [defaultValue]);

    const { data: types } = useQuery({
        queryKey: ['expense-types'],
        queryFn: async () => {
            const response = await axios.get(getAdminApiUrl(companyId, '/expenses/type'));
            return response.data.data;
        },
    });

    const renderExpenseTypeSearch = () => {
        return (
            <Autocomplete
                options={[
                    { id: -1, name: '-- N/A --' },
                    ...(types || []),
                ]}
                getOptionLabel={(option: any) => option.name}
                renderInput={(params) => <TextField {...params} label="Select Expense Type" />}
                value={selectedExpenseType}
                onChange={(e: any, value: any) => setSelectedExpenseType(value)}
            />
    );
  };

  return {
    selectedExpenseType,
    setSelectedExpenseType,
    renderExpenseTypeSearch,
  };
};

export default useSelectExpenseType;