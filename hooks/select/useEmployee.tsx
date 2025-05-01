import { getAdminsAndDrivers } from '@/app/utils/adminsAndDrivers';
import { MenuItem, Select } from '@mui/material';
import { useEffect, useState } from 'react';

const useEmployee = (defaultEmployee?: string) => {
  const [employee, setEmployee] = useState<string[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>(defaultEmployee || '');

  useEffect(() => {
    if (defaultEmployee) {
      setSelectedEmployee(defaultEmployee);
    }
  }, [defaultEmployee]);

  const fetchEmployee = async () => {
    try {
      const data = await getAdminsAndDrivers();

      setEmployee(data || []);
    } catch (error: any) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, []);

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
