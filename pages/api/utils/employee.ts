import { USER_ROLE } from '@/app/utils/enum';

const getRole = (role: string, name: string) => {
  if (role === USER_ROLE.ADMIN) {
    return 'Admin - ' + name;
  }

  if (role === USER_ROLE.DRIVER) {
    return 'Driver - ' + name;
  }

  if (role === USER_ROLE.SUPER_ADMIN) {
    return 'S Admin - ' + name;
  }

  if (role === USER_ROLE.WAREHOUSE) {
    return 'Warehouse - ' + name;
  }

  return name;
};

const decodeRole = (role: string) => {
  if (role.includes('S Admin')) {
    return USER_ROLE.SUPER_ADMIN;
  }
  
  if (role.includes('Admin')) {
    return USER_ROLE.ADMIN;
  }

  if (role.includes('Driver')) {
    return USER_ROLE.DRIVER;
  }

  if (role.includes('Warehouse')) {
    return USER_ROLE.WAREHOUSE;
  }

  return USER_ROLE.GUEST;
};

export { getRole, decodeRole };
