import { configureStore } from "@reduxjs/toolkit";
import authReducer     from "../store/authSlice";
import productsReducer from "../store/productsSlice";
import stockReducer    from "../store/stockSlice";
import vendorsReducer  from "../store/vendorSlice";

export const store = configureStore({
  reducer: {
    auth:     authReducer,
    products: productsReducer,
    stock:    stockReducer,
    vendors:  vendorsReducer,
  },
});

export type RootState  = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
