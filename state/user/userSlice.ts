import { API_URL, USER_CATEGORIZED, USER_ROLE } from '@/app/utils/enum';
import { User } from '@prisma/client';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface UserState extends User {}

export interface GuestUserParams {
  guestSessionId: string;
  guestSessionSignature: string;
  name: string;
  email: string;
  contactNumber: string;
  deliveryAddress: string;
}

const initialState: UserState = {
  id: -1,
  clientName: '',
  clientId: '',
  email: '',
  contactNumber: '',
  deliveryAddress: '',
  deliveryAddressLat: 0,
  deliveryAddressLng: 0,
  sheetName: '',
  password: '',
  subCategoryId: -1,
  userPreferenceId: -1,
  categoryId: -1,
  role: USER_ROLE.GUEST,
  createdAt: '',
  guestSessionId: null,
  type: USER_CATEGORIZED.INACTIVE,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateUser: (state: UserState, action: PayloadAction<UserState>) => {
      // Assign action.payload to state
      Object.assign(state, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createGuestUser.fulfilled, (state, action) => {
        const data = action.payload;
        Object.assign(state, data);
      })
      .addCase(createGuestUser.rejected, (state, action) => {
        console.error('Fail to create guest: ', action.payload);
      });
  },
});

export const createGuestUser = createAsyncThunk(
  'createGuestUser',
  async (user: GuestUserParams) => {
    try {
      const response = await axios.post(`${API_URL.PUBLIC}/create-guest`, user);

      if (response.data.error) {
        throw new Error('Something went wrong. ', response.data.error);
      }

      return response.data;
    } catch (error: any) {
      console.error('Something went wrong: ', error);
      throw new Error('Something went wrong', error?.response?.data?.error);
    }
  },
);

export default userSlice.reducer;