import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserProfile {
  name: string;
  address: string;
  profileImage: string | null;
}

const initialState: UserProfile = {
  name: 'Guest User',
  address: '',
  profileImage: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateProfile: (state, action: PayloadAction<UserProfile>) => {
      state.name = action.payload.name;
      state.address = action.payload.address;
      state.profileImage = action.payload.profileImage;
    },
  },
});

export const { updateProfile } = userSlice.actions;

export default userSlice.reducer;
