import { fetchApi } from '@/app/utils/db';
import { getAdminApiUrl } from '@/app/utils/enum';
import { Autocomplete, TextField } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';

const useClients = () => {
  const { companyId }: any = useParams();
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  const fetchClients = async () => {
    const data = await fetchApi(getAdminApiUrl(companyId, '/clients'));
    setClients(data);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  console.log(selectedClient);

  const renderClientSearch = useCallback(() => {
    return (
      <Autocomplete
        options={clients || []}
        getOptionLabel={(option: any) => `${option.clientId} - ${option.clientName}`}
        renderInput={(params) => <TextField {...params} label="Client" />}
        value={
          clients?.find(
            (item: any) =>
              item.clientId === selectedClient?.clientId ||
              item.clientName === selectedClient?.clientName,
          ) || null
        }
        onChange={(e, newValue: any) => {
          setSelectedClient(newValue);
        }}
        sx={{ width: 'auto' }}
      />
    );
  }, [clients, selectedClient]);

  return useMemo(() => {
    return {
      clients,
      renderClientSearch,
      selectedClient,
      setSelectedClient,
    };
  }, [clients, selectedClient]);
};

export default useClients;
