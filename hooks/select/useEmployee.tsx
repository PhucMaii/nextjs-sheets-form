import { getAdminsAndDrivers } from '@/app/utils/adminsAndDrivers';
import { MenuItem, Select } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const useEmployee = (defaultEmployee?: string) => {
  const { companyId }: any = useParams();
  const [employee, setEmployee] = useState<string[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>(
    defaultEmployee || '',
  );

  useEffect(() => {
    if (defaultEmployee) {
      setSelectedEmployee(defaultEmployee);
    }
  }, [defaultEmployee]);

  const fetchEmployee = async () => {
    try {
      const data = await getAdminsAndDrivers(companyId);

      setEmployee(data || []);
    } catch (error: any) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchEmployee();
    }
  }, [companyId]);

  const renderEmployeeSearch = () => {
    return (
      <Select
        value={selectedEmployee}
        onChange={(e) => setSelectedEmployee(e.target.value)}
        size="small"
        fullWidth
      >
        {employee.map((employee: string, index: number) => (
          <MenuItem key={index} value={employee}>
            {employee}
          </MenuItem>
        ))}
      </Select>
    );
  };

  return {
    selectedEmployee,
    renderEmployeeSearch,
  };
};

export default useEmployee;
