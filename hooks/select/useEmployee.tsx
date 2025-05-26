import { getAdminsAndDrivers } from '@/app/utils/adminsAndDrivers';
import { MenuItem, Select } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getAdminApiUrl } from '@/app/utils/enum';
import { fetchApi } from '@/app/utils/db';
import { decodeRole } from '@/pages/api/utils/employee';

const useEmployee = (defaultEmployee?: string) => {
  const { companyId }: any = useParams();
  const [allEmployees, setAllEmployees] = useState<any[]>([]);
  const [employee, setEmployee] = useState<string[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>(
    defaultEmployee || '',
  );
  const [selectedEmployeeData, setSelectedEmployeeData] = useState<any>(null);

  useEffect(() => {
    if (defaultEmployee) {
      setSelectedEmployee(defaultEmployee);
    }
  }, [defaultEmployee]);

  useEffect(() => {
    if (companyId) {
      fetchEmployeesData();
    }
  }, [companyId]);

  useEffect(() => {
    if (selectedEmployee && allEmployees.length > 0) {
      setSelectedEmployeeData(allEmployees.find((employee) => {
        const role = decodeRole(selectedEmployee);
        const name = selectedEmployee.split(' - ')[1];

        return employee.role === role && employee.name === name;
      }));
    }
  }, [selectedEmployee, allEmployees]);

  const fetchEmployee = async () => {
    try {
      const data = await getAdminsAndDrivers(companyId);

      setEmployee(data || []);
    } catch (error: any) {
      console.log(error);
    }
  };

  const fetchEmployeesData = async () => {
    try {
      const data = await fetchApi(getAdminApiUrl(companyId, '/employees'));

      setAllEmployees(data);
    } catch (error: any) {
      console.log(error);
    }
  }

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
    selectedEmployeeData,
  };
};

export default useEmployee;
