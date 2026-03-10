import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import { mockCategories, mockVendors } from "@/mock/mockData";
import {
  ArrowLeft,
  Package,
  Tag,
  Hash,
  BarChart2,
  AlertTriangle,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Truck,
  AlignLeft,
  User,
} from "lucide-react";

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const product = useAppSelector((s) =>
    s.products.items.find((p) => p.id === id),
  );
  const entries = useAppSelector((s) =>
    s.stock.entries.filter((e) => e.productId === id),
  );

  if (!product) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Package
          size={40}
          className="mb-3 opacity-20"
          style={{ color: "#fff" }}
        />
        <p className="text-white font-semibold mb-1">Product not found</p>
        <p className="text-sm mb-4" style={{ color: "#555" }}>
          The product you're looking for doesn't exist.
        </p>
        <button
          onClick={() => navigate("/products")}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: "#2a2a2a" }}
        >
          Back to Products
        </button>
      </div>
    );
  }

  const isLow = product.quantity <= product.threshold;
  const category =
    mockCategories.find((c) => c.id === product.categoryId)?.name ?? "—";
  const vendor =
    mockVendors.find((v) => v.id === product.vendorId)?.name ?? "—";
  const stockInTotal = entries
    .filter((e) => e.type === "STOCK_IN")
    .reduce((s, e) => s + e.quantity, 0);
  const stockOutTotal = entries
    .filter((e) => e.type === "STOCK_OUT")
    .reduce((s, e) => s + e.quantity, 0);

  const InfoRow = ({
    icon: Icon,
    label,
    value,
    valueColor,
  }: {
    icon: React.ElementType;
    label: string;
    value: string;
    valueColor?: string;
  }) => (
    <div
      className="flex items-start gap-3 py-3"
      style={{ borderBottom: "1px solid #242424" }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: "#242424" }}
      >
        <Icon size={14} style={{ color: "#666" }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs mb-0.5" style={{ color: "#555" }}>
          {label}
        </p>
        <p
          className="text-sm font-medium truncate"
          style={{ color: valueColor ?? "white" }}
        >
          {value}
        </p>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6">
      {/* Back button + header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate("/products")}
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: "#1e1e1e",
            border: "1px solid #242424",
            color: "#666",
          }}
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white leading-none">
            {product.name}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#666" }}>
            {product.sku}
          </p>
        </div>
        {isLow && (
          <span
            className="ml-auto flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg"
            style={{
              background: "#e2481520",
              color: "#e24815",
              border: "1px solid #e2481540",
            }}
          >
            <AlertTriangle size={11} />
            Low Stock
          </span>
        )}
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          {
            label: "Current Stock",
            value: String(product.quantity),
            color: isLow ? "#e24815" : "#10b981",
          },
          {
            label: "Min Threshold",
            value: String(product.threshold),
            color: "#f5c573",
          },
          {
            label: "Total Stock In",
            value: String(stockInTotal),
            color: "#10b981",
          },
          {
            label: "Total Stock Out",
            value: String(stockOutTotal),
            color: "#e24815",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="p-4 rounded-xl"
            style={{ background: "#1e1e1e", border: "1px solid #242424" }}
          >
            <p className="text-xs mb-2" style={{ color: "#666" }}>
              {label}
            </p>
            <p className="text-2xl font-bold" style={{ color }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Product Info */}
        <div
          className="rounded-xl p-4 md:p-5"
          style={{ background: "#1e1e1e", border: "1px solid #242424" }}
        >
          <h2 className="text-sm font-semibold text-white mb-1">
            Product Info
          </h2>

          <InfoRow icon={Hash} label="SKU" value={product.sku} />
          <InfoRow icon={Tag} label="Category" value={category} />
          <InfoRow icon={Truck} label="Vendor" value={vendor} />
          <InfoRow
            icon={User}
            label="Supplier Name"
            value={product.supplierName || "—"}
          />
          <InfoRow
            icon={DollarSign}
            label="Price"
            value={
              product.price && product.price > 0
                ? `₹${product.price.toFixed(2)}`
                : "—"
            }
          />
          <InfoRow
            icon={BarChart2}
            label="Stock Status"
            value={isLow ? "Low — needs restocking" : "Healthy"}
            valueColor={isLow ? "#e24815" : "#10b981"}
          />
          <InfoRow
            icon={Calendar}
            label="Created"
            value={new Date().toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          />

          {/* Description */}
          {product.description && (
            <div className="flex items-start gap-3 pt-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: "#242424" }}
              >
                <AlignLeft size={14} style={{ color: "#666" }} />
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: "#555" }}>
                  Description
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#aaa" }}
                >
                  {product.description}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Stock History */}
        <div
          className="rounded-xl p-4 md:p-5"
          style={{ background: "#1e1e1e", border: "1px solid #242424" }}
        >
          <h2 className="text-sm font-semibold text-white mb-4">
            Stock History
            <span
              className="ml-2 text-xs font-normal px-2 py-0.5 rounded"
              style={{ background: "#2a2a2a", color: "#666" }}
            >
              {entries.length} entries
            </span>
          </h2>

          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <BarChart2
                size={28}
                className="mb-2 opacity-20"
                style={{ color: "#fff" }}
              />
              <p className="text-sm" style={{ color: "#555" }}>
                No movements yet
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto scrollbar-hide">
              {entries.map((e) => {
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
                          <TrendingDown
                            size={12}
                            style={{ color: "#e24815" }}
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-medium px-1.5 py-0.5 rounded"
                            style={{
                              background: isIn ? "#10b98120" : "#e2481520",
                              color: isIn ? "#10b981" : "#e24815",
                            }}
                          >
                            {isIn ? "IN" : "OUT"}
                          </span>
                          <p
                            className="text-xs truncate"
                            style={{ color: "#666" }}
                          >
                            {e.note || "No note"}
                          </p>
                        </div>
                        {(e as any).performedBy && (
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: "#444" }}
                          >
                            By {(e as any).performedBy}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p
                        className="text-sm font-bold"
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
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
