import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { mockStockEntries } from "@/mock/mockData";
import { logout } from "./authSlice";

export interface StockEntry {
  id: string; productId: string;
  type: "STOCK_IN" | "STOCK_OUT";
  quantity: number; note: string; createdAt: string;
  performedBy: string; 
}

const stockSlice = createSlice({
  name: "stock",
  initialState: { entries: mockStockEntries as StockEntry[] },
  reducers: {
    addStockEntry(state, { payload }: PayloadAction<Omit<StockEntry, "id" | "createdAt">>) {
      state.entries.unshift({
        ...payload,
        id: `s${Date.now()}`,
        createdAt: new Date().toISOString(),
      });
    },
  },
    extraReducers: (builder) => {
    builder.addCase(logout, (state) => {
      state.entries = mockStockEntries as StockEntry[];
    });
  },
});

export const { addStockEntry } = stockSlice.actions;
export default stockSlice.reducer;
