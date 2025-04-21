// store/features/favoritesSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface FavoriteItem {
  id: any;
  title: string;
  price: number;
  image: string;
  vendorWhatsApp?: string;
  vendorPhoneNumber?: string;
}

interface FavoritesState {
  items: FavoriteItem[];
}

const initialState: FavoritesState = {
  items: [],
};

// Load favorites from AsyncStorage when the app starts
const loadFavoritesFromStorage = async (): Promise<FavoriteItem[]> => {
  try {
    const storedFavorites = await AsyncStorage.getItem("favorites");
    return storedFavorites ? JSON.parse(storedFavorites) : [];
  } catch (error) {
    console.error("Error loading favorites from storage:", error);
    return [];
  }
};

// Save favorites to AsyncStorage
const saveFavoritesToStorage = async (items: FavoriteItem[]) => {
  try {
    await AsyncStorage.setItem("favorites", JSON.stringify(items));
  } catch (error) {
    console.error("Error saving favorites to storage:", error);
  }
};

export const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    addToFavorites: (state, action: PayloadAction<FavoriteItem>) => {
      const exists = state.items.find((item) => item.id === action.payload.id);
      if (!exists) {
        state.items.push(action.payload);
        saveFavoritesToStorage(state.items); // Persist to AsyncStorage
      }
    },
    removeFromFavorites: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      saveFavoritesToStorage(state.items); // Persist to AsyncStorage
    },
    loadFavorites: (state, action: PayloadAction<FavoriteItem[]>) => {
      state.items = action.payload;
    },
  },
});

export const { addToFavorites, removeFromFavorites, loadFavorites } =
  favoritesSlice.actions;

export default favoritesSlice.reducer;

// Thunk to load favorites from AsyncStorage when the app initializes
export const initializeFavorites = () => async (dispatch: any) => {
  const favorites = await loadFavoritesFromStorage();
  dispatch(loadFavorites(favorites));
};