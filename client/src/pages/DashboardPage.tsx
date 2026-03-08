import { useAppSelector } from "@/app/hooks";
import { mockCategories } from "@/mock/mockData";
import {
  Package,
  AlertTriangle,
  Truck,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const DashboardPage = () => {
  const user = useAppSelector((s) => s.auth.user);
  const products = useAppSelector((s) => s.products.items);
  const entries = useAppSelector((s) => s.stock.entries);
  const vendors = useAppSelector((s) => s.vendors.vendors);

  const lowStock = products.filter((p) => p.quantity <= p.threshold);
  const getCat = (id: string) =>
    mockCategories.find((c) => c.id === id)?.name ?? id;
  const getProd = (id: string) => products.find((p) => p.id === id);

  const stats = [
    {
      label: "Total Products",
      value: products.length,
      icon: Package,
      color: "#3b82f6",
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
      color: "#10b981",
    },
    {
      label: "Stock Movements",
      value: entries.length,
      icon: ArrowLeftRight,
      color: "#f5c573",
    },
  ];

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl md:text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: "#666" }}>
          Welcome back, {user?.name}
        </p>
      </div>

      {/* Stat cards — 2 col on mobile, 4 on desktop */}
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

      {/* Lower panels — stacked on mobile, 2-col on desktop */}
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
