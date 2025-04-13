import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PassHomeState {
  value: boolean;
}

const initialState: PassHomeState = {
  value: true,
};

const passHomeSlice = createSlice({
  name: 'passHome',
  initialState,
  reducers: {
    setPassHome: (state, action: PayloadAction<boolean>) => {
      state.value = action.payload;
    },
  },
});

export const { setPassHome } = passHomeSlice.actions;
export default passHomeSlice.reducer;