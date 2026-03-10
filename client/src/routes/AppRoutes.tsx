import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Layout from "../components/Ui/Layout";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import ProductsPage from "@/pages/ProductsPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import StockPage from "@/pages/StockPage";
import VendorsPage from "@/pages/VendorsPage";
import Notfound from "@/global/Notfound";

const AppRoutes = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    {/* Protected routes */}
    <Route element={<ProtectedRoute />}>
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/stock" element={<StockPage />} />
        <Route path="/vendors" element={<VendorsPage />} />

        {/* Admin only */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <div className="p-6">
                <h1 className="text-white text-xl font-bold">Settings</h1>
                <p className="text-sm mt-1" style={{ color: "#666" }}>
                  Admin-only area.
                </p>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Route>

    {/* 404 */}
    <Route path="*" element={<Notfound />} />
  </Routes>
);

export default AppRoutes;
