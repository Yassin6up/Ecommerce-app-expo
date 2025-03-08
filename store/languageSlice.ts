import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LanguageState = {
  currentLanguage: string;
};

// Load initial language from AsyncStorage (default to 'ar' if not found)
const loadInitialLanguage = async (): Promise<string> => {
  try {
    const savedLanguage = await AsyncStorage.getItem('language');
    return savedLanguage || 'ar'; // Default to 'ar' if nothing is saved
  } catch (error) {
    console.error('Error loading language from AsyncStorage:', error);
    return 'ar'; // Fallback to 'ar' on error
  }
};

// Initialize state (we'll set this later in the store setup)
const initialState: LanguageState = {
  currentLanguage: 'ar', // Placeholder, will be overridden
};

// Thunk to set language and save to AsyncStorage
export const setLanguageAndPersist = createAsyncThunk(
  'language/setLanguageAndPersist',
  async (language: string, { dispatch }) => {
    try {
      await AsyncStorage.setItem('language', language);
      dispatch(setLanguage(language)); // Update Redux state
      return language;
    } catch (error) {
      console.error('Error saving language to AsyncStorage:', error);
      throw error;
    }
  }
);

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.currentLanguage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setLanguageAndPersist.fulfilled, (state, action) => {
      state.currentLanguage = action.payload; // Ensure state is updated
    });
  },
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;

// Export a function to initialize state with AsyncStorage
export const initializeLanguageState = async () => {
  const currentLanguage = await loadInitialLanguage();
  return { currentLanguage };
};