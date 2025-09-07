import { createContext, useEffect, useState } from 'react';
import { UserType } from '../utils/type';
import axios from 'axios';
import { getAdminApiUrl, USER_ROLE } from '../utils/enum';

export const GuestContext = createContext<any>({
  guests: [],
  getGuests: () => Promise.resolve(),
});

const GuestProvider = ({ children }: { children: React.ReactNode }) => {
  const [guests, setGuests] = useState<UserType[]>([]);
  useEffect(() => {
    getGuests();
  }, []);

  const getGuests = async () => {
    const response = await axios.get(
      getAdminApiUrl('1', '/clients', `role=${USER_ROLE.GUEST}`),
    );
    setGuests(response.data.data);
  };

  return (
    <GuestContext.Provider value={{ guests, getGuests }}>
      {children}
    </GuestContext.Provider>
  );
};

export default GuestProvider;
