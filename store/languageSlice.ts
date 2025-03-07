import { createSlice } from '@reduxjs/toolkit';

type LanguageState = {
  currentLanguage: string;
};

const initialState: LanguageState = {
  currentLanguage: 'en', // Default to English
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.currentLanguage = action.payload;
    },
  },
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;
