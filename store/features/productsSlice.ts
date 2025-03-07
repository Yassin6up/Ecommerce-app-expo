import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'https://backend.j-byu.shop/api/random-products';

// Fetch all products
export const fetchAllProducts = createAsyncThunk(
    'products/fetchAll',
    async (params?: { status?: string; category_id?: string; search?: string; user_id?: string }) => {
      try {
        const response = await axios.get(`${BASE_URL}`, {  params: { user_id: '1' }, });
        console.log("API Response:", response.data); // Debug API response
        return response.data;
      } catch (error) {
        console.error("API Error:", error);
        throw error;
      }
    }
  );
  

// Add a new product
export const addProduct = createAsyncThunk(
    'products/add',
    async (productData: { name: string; price: number; sku: string; total: number; desc: string; category: string; images: File[] }) => {
      const formData = new FormData();
  
      // Append all product details except images
      Object.entries(productData).forEach(([key, value]) => {
        if (key === 'images' && Array.isArray(value)) {
          value.forEach((image) => formData.append('images', image));
        } else {
          formData.append(key, String(value)); // Convert value to string
        }
      });
  
      const response = await axios.post(BASE_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      return response.data;
    }
  );

// Initial state
interface ProductState {
  products: any[];
  status: string;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  status: 'idle',
  error: null,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.products = action.payload;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Something went wrong';
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.products.push(action.payload);
      });
  },
});

export default productsSlice.reducer;
