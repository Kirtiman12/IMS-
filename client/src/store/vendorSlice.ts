import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { mockVendors, mockPurchaseEntries } from "@/mock/mockData";
import { logout } from "./authSlice"; 

export interface Vendor {
  id: string; name: string; email: string; phone: string; address: string;
}
export interface PurchaseEntry {
  id: string; vendorId: string; amount: number; note: string; createdAt: string;
}

const vendorsSlice = createSlice({
  name: "vendors",
  initialState: {
    vendors:   mockVendors as Vendor[],
    purchases: mockPurchaseEntries as PurchaseEntry[],
  },
  reducers: {
    addVendor(state, { payload }: PayloadAction<Omit<Vendor, "id">>) {
      state.vendors.push({ ...payload, id: `v${Date.now()}` });
    },
    addPurchaseEntry(state, { payload }: PayloadAction<Omit<PurchaseEntry, "id" | "createdAt">>) {
      state.purchases.unshift({ ...payload, id: `pe${Date.now()}`, createdAt: new Date().toISOString() });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, (state) => {
      state.vendors   = mockVendors as Vendor[];
      state.purchases = mockPurchaseEntries as PurchaseEntry[];
    });
  },
});

export const { addVendor, addPurchaseEntry } = vendorsSlice.actions;
export default vendorsSlice.reducer;
