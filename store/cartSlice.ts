import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
  status?: 'in_cart' | 'on_the_way' | 'removed';
}

interface CartState {
  items: CartItem[];
  totalAmount: number;
  orderStatus: 'idle' | 'loading' | 'success' | 'error';
}

const initialState: CartState = {
  items: [],
  totalAmount: 0,
  orderStatus: 'idle',
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const { id, size, color, price } = action.payload;
      const existingItem = state.items.find(
        item => item.id === id && item.size === size && item.color === color
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1, status: 'in_cart' });
      }
      state.totalAmount += price;
    },
    // Empty cart action
    emptyCart: (state) => {
      state.items = [];
    },
    incrementQuantity: (state, action: PayloadAction<{ id: number; size?: string; color?: string }>) => {
      const { id, size, color } = action.payload;
      const item = state.items.find(
        item => item.id === id && item.size === size && item.color === color
      );

      if (item) {
        item.quantity += 1;
        state.totalAmount += item.price;
      }
    },
    decrementQuantity: (state, action: PayloadAction<{ id: number; size?: string; color?: string }>) => {
      const { id, size, color } = action.payload;
      const item = state.items.find(
        item => item.id === id && item.size === size && item.color === color
      );

      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
          state.totalAmount -= item.price;
        } else {
          state.items = state.items.filter(
            i => !(i.id === id && i.size === size && i.color === color)
          );
          state.totalAmount -= item.price;
        }
      }
    },
    markAsRemoved: (state, action: PayloadAction<{ id: number; size?: string; color?: string }>) => {
      const item = state.items.find(
        item => item.id === action.payload.id && item.size === action.payload.size && item.color === action.payload.color
      );
      if (item) {
        item.status = 'removed';
      }
    },
    removeFromCart: (state, action: PayloadAction<{ id: number; size?: string; color?: string }>) => {
      state.items = state.items.filter(
        item => !(item.id === action.payload.id && item.size === action.payload.size && item.color === action.payload.color)
      );
    },
    clearCart: state => {
      state.items = [];
      state.totalAmount = 0;
      state.orderStatus = 'idle';
    },
    sendOrder: (state) => {
      state.orderStatus = "loading";
      state.items = state.items.map((item) => ({
        ...item,
        status: "on_the_way", 
      }));
    },
    orderSuccess: state => {
      state.orderStatus = 'success';
      state.items = [];
      state.totalAmount = 0;
    },
    orderError: state => {
      state.orderStatus = 'error';
    },
  },
});

export const {
  addToCart,
  incrementQuantity,
  decrementQuantity,
  clearCart,
  removeFromCart,
  markAsRemoved,
  sendOrder,
  orderSuccess,
  orderError,
  emptyCart
} = cartSlice.actions;

export default cartSlice.reducer;
