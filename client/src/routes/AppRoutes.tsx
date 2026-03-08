import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Layout from "../components/Ui/Layout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import ProductsPage from "../pages/ProductsPage";
import StockPage from "../pages/StockPage";
import VendorsPage from "../pages/VendorsPage";
import Notfound from "../global/Notfound";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<LoginPage />} />

    <Route element={<ProtectedRoute />}>
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/stock" element={<StockPage />} />
        <Route path="/vendors" element={<VendorsPage />} />

        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route
            path="/settings"
            element={
              <div className="p-8">
                <h1 className="text-2xl font-bold text-white">Settings</h1>
                <p className="mt-2 text-sm" style={{ color: "#666" }}>
                  Admin-only area.
                </p>
              </div>
            }
          />
        </Route>
      </Route>
    </Route>

    <Route path="*" element={<Notfound />} />
  </Routes>
);

export default AppRoutes;
