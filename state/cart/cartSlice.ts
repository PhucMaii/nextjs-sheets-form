import { API_URL } from '@/app/utils/enum';
import { ICart } from '@/app/utils/type';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface CartState extends ICart {}

interface AsyncReducerResponseType {
  data: CartState;
  message: string;
}

const initialState: CartState = {
  id: -1,
  shippingFee: 0,
  discount: 0,
  subtotal: 0,
  totalPrice: 0,
  PST: 0,
  GST: 0,
  createdAt: '',
  createdBy: '',
  items: [],
  note: null,
  userId: null,
  guestSessionId: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    updateCart: (state: CartState, action: PayloadAction<CartState>) => {
      // Assign action.payload to state
      Object.assign(state, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        addItemToCartAsync.fulfilled,
        (state, action: PayloadAction<AsyncReducerResponseType>) => {
          // Assign data to state
          const { data } = action.payload;
          Object.assign(state, data);
        },
      )
      .addCase(addItemToCartAsync.rejected, (state, action) => {
        console.error('Fail to add item to cart: ', action.payload);
      })
      .addCase(
        removeItemAsync.fulfilled,
        (state, action: PayloadAction<AsyncReducerResponseType>) => {
          const { data } = action.payload;
          Object.assign(state, data);
        },
      )
      .addCase(removeItemAsync.rejected, (state, action) => {
        console.error('Fail to remove item from cart: ', action.payload);
      })
      .addCase(
        updateItemQuantity.fulfilled,
        (state, action: PayloadAction<AsyncReducerResponseType>) => {
          const { data } = action.payload;
          Object.assign(state, data);
        },
      )
      .addCase(
        updateItemQuantity.rejected,
        (state, action) => {
            console.error('Fail to update item quantity: ', action.payload);
        },
      )
      .addCase(
        updateCartAsync.fulfilled,
        (state, action: PayloadAction<AsyncReducerResponseType>) => {
          const { data } = action.payload;
          Object.assign(state, data);
        },
      )
      .addCase(updateCartAsync.rejected, (state, action) => {
        console.error('Fail to update cart: ', action.payload);
      });
  },
});

export const addItemToCartAsync = createAsyncThunk(
  'addToCart',
  async ({ cartId, item }: { cartId: number; item: any }) => {
    try {
      const ipResponse = await axios.get('https://api.ipify.org?format=json');
      const response = await axios.post(`${API_URL.PUBLIC}/cart/add-to-cart`, {
        item,
        cartId,
        ipAddress: ipResponse.data.ip,
      });

      if (response.data.error) {
        throw new Error('Something went wrong. ', response.data.error);
      }

      return response.data; // { data, message }
    } catch (error: any) {
      console.error('Something went wrong: ', error);
      throw new Error('Something went wrong', error?.response?.data?.error);
    }
  },
);

export const removeItemAsync = createAsyncThunk(
  'removeItem',
  async ({ itemId }: { itemId: number }) => {
    try {
      const response = await axios.delete(
        `${API_URL.PUBLIC}/cart/remove-item?itemId=${itemId}`,
      );

      if (response.data.error) {
        throw new Error('Something went wrong. ', response.data.error);
      }

      return response.data; // { data, message }
    } catch (error: any) {
      console.error('Internal Server Error: ', error);
      throw new Error('Something went wrong. ', error?.response?.data?.error);
    }
  },
);

export const updateItemQuantity = createAsyncThunk(
  'updateItemQuantity',
  async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
    try {
      const response = await axios.put(
        `${API_URL.PUBLIC}/cart/update-cart-item`,
        {
          itemId,
          quantity,
        },
      );

      if (response.data.error) {
        throw new Error('Something went wrong. ', response.data.error);
      }

      return response.data; // { data, message }
    } catch (error: any) {
      console.error('Internal Server Error', error);
      throw new Error('Something went wrong. ', error);
    }
  },
);

export const updateCartAsync = createAsyncThunk(
  'updateCartAsync',
  async ({cartId, updatedData}: {cartId: number, updatedData: object}) => {
    try {
      const response = await axios.put(`${API_URL.PUBLIC}/cart`, {
        id: cartId,
        updatedData,
      });

      if (response.data.error) {  
        throw new Error('Something went wrong. ', response.data.error);
      }

      return response.data; // { data, message }
    } catch (error: any) {
      console.error('Internal Server Error', error);
      throw new Error('Something went wrong. ', error);
    }
  }
)

export const { updateCart } = cartSlice.actions;

export default cartSlice.reducer;
