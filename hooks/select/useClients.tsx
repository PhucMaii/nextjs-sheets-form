import { getAdminApiUrl } from "@/app/utils/enum";
import { Autocomplete, TextField } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";


const useClients = (companyId: string) => {
    const [selectedClient, setSelectedClient] = useState<any>(null);
    
    const { data: clients } = useQuery({
        queryKey: ['clients', companyId],
        queryFn: async () => {
            const response = await axios.get(getAdminApiUrl(companyId, '/clients'));
            console.log(response.data.data);
            return response.data.data;
        },
    });

    const renderClientSearch = () => {
        return (
            <Autocomplete
                options={[
                    { id: -1, clientName: '-- Choose Client --', clientId: 'N/A' },
                    ...(clients || []),
                ]}
                getOptionLabel={(option: any) =>
                    `${option?.clientName} - ${option?.clientId}`
                }
                renderOption={(props, option) => (
                    <li {...props} aria-disabled={option.id === -1}>
                        {option?.clientName} - {option?.clientId}
                    </li>
                )}
                renderInput={(params) => <TextField {...params} label="Select Client" />}
                value={selectedClient}
                onChange={(e: any, value: any) => {
                    setSelectedClient(value);
                }}
            />
        );
    };

    return {
        clients,
        renderClientSearch,
        selectedClient,
        setSelectedClient,
    };
}

export default useClients;