import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './themeSlice';
import languageReducer from './languageSlice';
import cartReducer from './cartSlice';
import userReducer from "./userSlice";
import passHomeReducer from './PassHomeSlice';
import searchReducer from "./searchSlice";
import productsReducer from './features/productsSlice';
import categoriesReducer from './categories/categoriesSlice';
import favoritesReducer from "./features/favoritesSlice"
const store = configureStore({
  reducer: {
    theme: themeReducer,
    language: languageReducer,
    cart: cartReducer,
    user: userReducer,
    passHome: passHomeReducer,
    search: searchReducer,
    products: productsReducer,
    categories: categoriesReducer,
    favorites: favoritesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
