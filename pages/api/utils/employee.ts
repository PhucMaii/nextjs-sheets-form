import { USER_ROLE } from "@/app/utils/enum";

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

      return name;
};

export { getRole };