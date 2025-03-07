import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'https://backend.j-byu.shop/api/categories';

// Define the Category type
interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  children?:any
}

// Define the slice state type
interface CategoriesState {
  items: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  items: [],
  loading: false,
  error: null,
};

// Fetch all categories
export const fetchCategories = createAsyncThunk<Category[], void, { rejectValue: string }>(
  'categories/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/all`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch categories');
    }
  }
);

// Add a new category
export const addCategory = createAsyncThunk<
  Category,
  { name: string; slug?: string; description?: string; image?: File },
  { rejectValue: string }
>(
  'categories/add',
  async (categoryData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('name', categoryData.name);
      if (categoryData.slug) formData.append('slug', categoryData.slug);
      if (categoryData.description) formData.append('description', categoryData.description);
      if (categoryData.image) formData.append('image', categoryData.image);

      const response = await axios.post(API_BASE_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to add category');
    }
  }
);

// Delete a category
export const deleteCategory = createAsyncThunk<string, string, { rejectValue: string }>(
  'categories/delete',
  async (categoryId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/${categoryId}`);
      return categoryId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to delete category');
    }
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      })

      // Add category
      .addCase(addCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.items.push(action.payload);
      })
      .addCase(addCategory.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Failed to add category';
      })

      // Delete category
      .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((category) => category.id !== action.payload);
      })
      .addCase(deleteCategory.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Failed to delete category';
      });
  },
});

export default categoriesSlice.reducer;
