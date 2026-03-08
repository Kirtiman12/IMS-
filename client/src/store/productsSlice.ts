import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { mockProducts } from "@/mock/mockData";

export interface Product {
  id: string; name: string; sku: string;
  categoryId: string; quantity: number;
  threshold: number; vendorId: string | null;
}

const productsSlice = createSlice({
  name: "products",
  initialState: { items: mockProducts as Product[] },
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
    adjustQuantity(state, { payload }: PayloadAction<{ productId: string; delta: number }>) {
      const p = state.items.find((p) => p.id === payload.productId);
      if (p) p.quantity = Math.max(0, p.quantity + payload.delta);
    },
  },
});

export const { addProduct, updateProduct, deleteProduct, adjustQuantity } = productsSlice.actions;
export default productsSlice.reducer;
