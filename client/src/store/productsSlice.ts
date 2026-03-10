import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { mockProducts } from "@/mock/mockData";

export interface Product {
  id:           string;
  name:         string;
  sku:          string;
  categoryId:   string;
  quantity:     number;
  threshold:    number;
  vendorId:     string | null;
  // new fields
  description?: string;
  price?:       number;
  supplierName?: string;
}

interface ProductsState {
  items: Product[];
  sortBy: "default" | "qty-asc" | "qty-desc" | "price-asc" | "price-desc";
}

const initialState: ProductsState = {
  items:  mockProducts as Product[],
  sortBy: "default",
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {

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

    setSortBy(
      state,
      { payload }: PayloadAction<ProductsState["sortBy"]>
    ) {
      state.sortBy = payload;
    },
  },
});

export const {
  addProduct,
  updateProduct,
  deleteProduct,
  adjustQuantity,
  setSortBy,
} = productsSlice.actions;

export default productsSlice.reducer;
