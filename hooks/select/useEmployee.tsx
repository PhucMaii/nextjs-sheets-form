import { getAllDataAdminsAndDrivers } from '@/app/utils/adminsAndDrivers';
import { USER_ROLE } from '@/app/utils/enum';
import { MenuItem, Select } from '@mui/material';
import { useEffect, useState } from 'react';

const useEmployee = () => {
  const [employee, setEmployee] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  console.log(selectedEmployee, 'selectedEmployee');

  const fetchEmployee = async () => {
    try {
      const data = await getAllDataAdminsAndDrivers();

      console.log(data, 'data');

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
        {employee.map((employee: any, index: number) => (
          <MenuItem key={index} value={employee}>
            {employee?.role === USER_ROLE.DRIVER ? 'Driver' : 'Admin'}-{' '}
            {employee?.clientName || employee?.name}
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
