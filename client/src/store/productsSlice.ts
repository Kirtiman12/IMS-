import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import api from "@/services/axiosInstance";
import { logout } from "./authSlice";

import { mockProducts } from "@/mock/mockData";

export interface Product {
  id:            string;
  name:          string;
  sku:           string;
  categoryId?:    string;
  quantity:      number;
  threshold:     number;
  vendorId:      string | null;
  description?:  string;
  price?:        number;
  supplierName?: string;
  // API-resolved relations (present when data comes from backend)
  category?:     { id: string; name: string };
  vendor?:       { id: string; name: string } | null;
}

interface ProductsState {
  items:    Product[];
  sortBy:   "default" | "qty-asc" | "qty-desc" | "price-asc" | "price-desc";
  loading:  boolean;
  saving:   boolean;
  apiReady: boolean;
  error:    string | null;
}

const initialState: ProductsState = {
  items: [] as Product[] ,
  sortBy:   "default",
  loading:  false,
  saving:   false,
  apiReady: false,
  error:    null,
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (params?: { categoryId?: string; search?: string; sortBy?: string }) => {
    const { data } = await api.get("/products", { params });
    return data as Product[];
  }
);

export const createProductThunk = createAsyncThunk(
  "products/create",
  async (body: Omit<Product, "id" | "category" | "vendor">) => {
    const { data } = await api.post("/products", body);
    return data as Product;
  }
);

export const updateProductThunk = createAsyncThunk(
  "products/update",
  async ({ id, ...body }: Partial<Omit<Product, "category" | "vendor">> & { id: string }) => {
    const { data } = await api.put(`/products/${id}`, body);
    return data as Product;
  }
);

export const deleteProductThunk = createAsyncThunk(
  "products/delete",
  async (id: string) => {
    await api.delete(`/products/${id}`);
    return id;
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    // ── Mock fallbacks (kept intact) ──────────────────────────────────────────
    setProducts(state, { payload }: PayloadAction<Product[]>) {
      state.items = payload;
    },
    addProduct(state, { payload }: PayloadAction<Omit<Product, "id">>) {
      state.items.push({ ...payload, id: `p${Date.now()}` });
    },
    updateProduct(state, { payload }: PayloadAction<Product>) {
      const i = state.items.findIndex((p) => p.id === payload.id);
      if (i !== -1) state.items[i] = payload;
    },
    deleteProduct(state, { payload }: PayloadAction<string>) {
      state.items = state.items.filter((p) => p.id !== payload);
    },
    adjustQuantity(
      state,
      { payload }: PayloadAction<{ productId: string; delta: number }>
    ) {
      const p = state.items.find((p) => p.id === payload.productId);
      if (p) p.quantity = Math.max(0, p.quantity + payload.delta);
    },
    setSortBy(state, { payload }: PayloadAction<ProductsState["sortBy"]>) {
      state.sortBy = payload;
    },
  },

  extraReducers: (builder) => {
    // ── fetchProducts ─────────────────────────────────────────────────────────
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchProducts.fulfilled, (state, { payload }) => {
        state.loading  = false;
        state.apiReady = true;
         state.items    = payload;
        const apiIds   = new Set(payload.map((p) => p.id));
        const mockOnly = state.items.filter((p) => !apiIds.has(p.id));
        state.items    = [...payload, ...mockOnly];
      })

      .addCase(fetchProducts.rejected, (state, { error }) => {
        state.loading = false;
        state.error   = error.message ?? "Failed to fetch products";
        // mock data stays as fallback — no items wipe
      });

    // ── createProductThunk ────────────────────────────────────────────────────
    builder
      .addCase(createProductThunk.pending,   (state) => { state.saving = true; })
      .addCase(createProductThunk.fulfilled, (state, { payload }) => {
        state.saving = false;
        state.items.unshift(payload);            // newest first
      })
      .addCase(createProductThunk.rejected,  (state, { error }) => {
        state.saving = false;
        state.error  = error.message ?? "Failed to create product";
      });

    // ── updateProductThunk ────────────────────────────────────────────────────
    builder
      .addCase(updateProductThunk.pending,   (state) => { state.saving = true; })
      .addCase(updateProductThunk.fulfilled, (state, { payload }) => {
        state.saving  = false;
        const i = state.items.findIndex((p) => p.id === payload.id);
        if (i !== -1) state.items[i] = payload;
      })
      .addCase(updateProductThunk.rejected,  (state, { error }) => {
        state.saving = false;
        state.error  = error.message ?? "Failed to update product";
      });

    // ── deleteProductThunk ────────────────────────────────────────────────────
    builder
      .addCase(deleteProductThunk.pending,   (state) => { state.saving = true; })
      .addCase(deleteProductThunk.fulfilled, (state, { payload: id }) => {
        state.saving = false;
        state.items  = state.items.filter((p) => p.id !== id);
      })
      .addCase(deleteProductThunk.rejected,  (state, { error }) => {
        state.saving = false;
        state.error  = error.message ?? "Failed to delete product";
      });
    builder.addCase(logout, (state) => {
  state.items    = [];
  state.loading  = false;
  state.saving   = false;
  state.apiReady = false;
  state.error    = null;
}); 
  },
  
});

export const {
  setProducts,   
  addProduct,
  updateProduct,
  deleteProduct,
  adjustQuantity,
  setSortBy,
} = productsSlice.actions;

export default productsSlice.reducer;
