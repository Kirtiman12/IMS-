import { useEffect, useState } from "react";
import { useAppSelector } from "@/app/hooks";
import { mockCategories } from "@/mock/mockData";
import {
  Package,
  AlertTriangle,
  Truck,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Boxes,
  X,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ToastContainer, useToast } from "@/components/Ui/Toast";

/* ── Low Stock Toast ─────────────────────────── */
const LowStockToast = ({
  items,
  onClose,
}: {
  items: { name: string }[];
  onClose: () => void;
}) => (
  <div
    className="fixed bottom-5 right-5 z-50 w-80 rounded-xl p-4 shadow-xl"
    style={{ background: "#1e1e1e", border: "1px solid #e2481540" }}
  >
    <div className="flex items-start justify-between mb-2">
      <div className="flex items-center gap-2">
        <AlertTriangle size={15} style={{ color: "#e24815" }} />
        <p className="text-sm font-semibold text-white">Low Stock Warning</p>
      </div>
      <button onClick={onClose} style={{ color: "#666" }}>
        <X size={15} />
      </button>
    </div>
    <p className="text-xs mb-2" style={{ color: "#888" }}>
      {items.length} item{items.length > 1 ? "s are" : " is"} running low:
    </p>
    <div className="flex flex-col gap-1">
      {items.slice(0, 4).map((p) => (
        <p
          key={p.name}
          className="text-xs px-2 py-1 rounded"
          style={{ background: "#e2481515", color: "#e24815" }}
        >
          {p.name}
        </p>
      ))}
      {items.length > 4 && (
        <p className="text-xs" style={{ color: "#555" }}>
          +{items.length - 4} more
        </p>
      )}
    </div>
  </div>
);

/* ── Custom Tooltip for chart ────────────────── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div
        className="px-3 py-2 rounded-lg text-xs"
        style={{ background: "#242424", border: "1px solid #333" }}
      >
        <p style={{ color: "#aaa" }}>{label}</p>
        <p className="font-semibold" style={{ color: "#e24815" }}>
          {payload[0].value} units
        </p>
      </div>
    );
  }
  return null;
};

/* ── Main Page ───────────────────────────────── */
const DashboardPage = () => {
  const user = useAppSelector((s) => s.auth.user);
  const products = useAppSelector((s) => s.products.items);
  const entries = useAppSelector((s) => s.stock.entries);
  const vendors = useAppSelector((s) => s.vendors.vendors);

  const [showToast, setShowToast] = useState(false);

  const lowStock = products.filter((p) => p.quantity <= p.threshold);
  const totalStockQty = products.reduce((acc, p) => acc + p.quantity, 0);
  const getCat = (id: string) =>
    mockCategories.find((c) => c.id === id)?.name ?? id;
  const getProd = (id: string) => products.find((p) => p.id === id);

  // Show toast once on mount if there are low stock items
  useEffect(() => {
    if (lowStock.length > 0) {
      setShowToast(true);
      const t = setTimeout(() => setShowToast(false), 8000);
      return () => clearTimeout(t);
    }
  }, []);

  // Chart data — top 6 products by quantity
  const chartData = [...products]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 6)
    .map((p) => ({
      name: p.name.length > 12 ? p.name.slice(0, 12) + "…" : p.name,
      qty: p.quantity,
    }));

  // Category breakdown for second chart
  const categoryData = mockCategories
    .map((cat) => ({
      name: cat.name,
      count: products.filter((p) => p.categoryId === cat.id).length,
    }))
    .filter((c) => c.count > 0);

  const CHART_COLORS = [
    "#e24815",
    "#3b82f6",
    "#10b981",
    "#f5c573",
    "#8b5cf6",
    "#ec4899",
  ];

  const stats = [
    {
      label: "Total Products",
      value: products.length,
      icon: Package,
      color: "#3b82f6",
    },
    {
      label: "Total Stock Units",
      value: totalStockQty,
      icon: Boxes,
      color: "#10b981",
    },
    {
      label: "Low Stock Alerts",
      value: lowStock.length,
      icon: AlertTriangle,
      color: "#e24815",
    },
    {
      label: "Total Vendors",
      value: vendors.length,
      icon: Truck,
      color: "#f5c573",
    },
  ];

  // Toast
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    if (lowStock.length > 0) {
      addToast(
        `${lowStock.length} item${lowStock.length > 1 ? "s are" : " is"} running low on stock`,
        "warning",
        8000,
      );
    }
  }, []);

  return (
    <div className="p-4 md:p-6">
      {/* Low stock toast */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl md:text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: "#666" }}>
          Welcome back, {user?.name}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="p-4 rounded-xl"
            style={{ background: "#1e1e1e", border: "1px solid #242424" }}
          >
            <div className="flex items-center justify-between mb-2">
              <p
                className="text-xs md:text-sm leading-snug"
                style={{ color: "#777" }}
              >
                {label}
              </p>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${color}22` }}
              >
                <Icon size={15} style={{ color }} />
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Stock by Product bar chart */}
        <div
          className="rounded-xl p-4 md:p-5"
          style={{ background: "#1e1e1e", border: "1px solid #242424" }}
        >
          <h2 className="text-sm font-semibold text-white mb-4">
            Stock by Product
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={chartData}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="name"
                tick={{ fill: "#555", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#555", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "#ffffff08" }}
              />
              <Bar dataKey="qty" radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Products by Category bar chart */}
        <div
          className="rounded-xl p-4 md:p-5"
          style={{ background: "#1e1e1e", border: "1px solid #242424" }}
        >
          <h2 className="text-sm font-semibold text-white mb-4">
            Products by Category
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={categoryData}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="name"
                tick={{ fill: "#555", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#555", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "#ffffff08" }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Low Stock + Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Low Stock Alerts */}
        <div
          className="rounded-xl p-4 md:p-5"
          style={{ background: "#1e1e1e", border: "1px solid #242424" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={14} style={{ color: "#e24815" }} />
            <h2 className="text-sm font-semibold text-white">
              Low Stock Alerts
            </h2>
            <span
              className="ml-auto text-xs px-2 py-0.5 rounded-full"
              style={{ background: "#e2481520", color: "#e24815" }}
            >
              {lowStock.length} items
            </span>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-sm" style={{ color: "#555" }}>
              All stock levels healthy ✓
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {lowStock.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                  style={{
                    background: "#e2481510",
                    border: "1px solid #e2481530",
                  }}
                >
                  <div className="min-w-0 mr-3">
                    <p className="text-sm font-medium text-white truncate">
                      {p.name}
                    </p>
                    <p className="text-xs" style={{ color: "#888" }}>
                      {p.sku} · {getCat(p.categoryId)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className="text-sm font-bold"
                      style={{ color: "#e24815" }}
                    >
                      {p.quantity}
                    </p>
                    <p className="text-xs" style={{ color: "#555" }}>
                      min {p.threshold}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div
          className="rounded-xl p-4 md:p-5"
          style={{ background: "#1e1e1e", border: "1px solid #242424" }}
        >
          <h2 className="text-sm font-semibold text-white mb-4">
            Recent Activity
          </h2>
          <div className="flex flex-col gap-2">
            {entries.slice(0, 6).map((e) => {
              const prod = getProd(e.productId);
              const isIn = e.type === "STOCK_IN";
              return (
                <div
                  key={e.id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                  style={{ background: "#242424" }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: isIn ? "#10b98120" : "#e2481520" }}
                    >
                      {isIn ? (
                        <TrendingUp size={12} style={{ color: "#10b981" }} />
                      ) : (
                        <TrendingDown size={12} style={{ color: "#e24815" }} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">
                        {prod?.name ?? e.productId}
                      </p>
                      <p className="text-xs truncate" style={{ color: "#555" }}>
                        {e.note}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p
                      className="text-sm font-semibold"
                      style={{ color: isIn ? "#10b981" : "#e24815" }}
                    >
                      {isIn ? "+" : "-"}
                      {e.quantity}
                    </p>
                    <p className="text-xs" style={{ color: "#444" }}>
                      {new Date(e.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
