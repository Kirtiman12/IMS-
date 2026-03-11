import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { addStockEntry } from "../store/stockSlice";
import {
  adjustQuantity,
  fetchProducts,
  setProducts,
  Product,
} from "@/store/productsSlice";
import { mockProducts } from "@/mock/mockData";
import useClickEffect from "@/hooks/useClickEffect";
import { TrendingUp, TrendingDown } from "lucide-react";
import api from "@/services/axiosInstance";

const StockPage = () => {
  const dispatch = useAppDispatch();
  const products = useAppSelector((s) => s.products.items);
  const mockEntries = useAppSelector((s) => s.stock.entries);
  const token = useAppSelector((s) => s.auth.token);
  const isRealUser = !!token;
  const userRole = useAppSelector((s) => s.auth.user?.role);
  const userName = useAppSelector((s) => s.auth.user?.name ?? "Unknown");

  const [apiEntries, setApiEntries] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [productsLoaded, setProductsLoaded] = useState(!isRealUser);
  const [productId, setProduct] = useState("");
  const [tab, setTab] = useState<"STOCK_IN" | "STOCK_OUT">("STOCK_IN");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [success, setSuccess] = useState("");

  // Single consolidated effect — resets + reloads on every user switch
  useEffect(() => {
    setApiEntries([]);
    setProductsLoaded(!isRealUser);
    setProduct("");

    if (isRealUser) {
      setLoadingHistory(true);
      api
        .get("/stock")
        .then((res) => setApiEntries(res.data))
        .catch(() => {})
        .finally(() => setLoadingHistory(false));
      dispatch(fetchProducts()).then(() => setProductsLoaded(true));
    } else {
      dispatch(setProducts(mockProducts as Product[])); // ← load mock products for demo
    }
  }, [isRealUser, dispatch]);

  const productList = isRealUser ? (productsLoaded ? products : []) : products;

  useEffect(() => {
    if (productList.length > 0 && !productId) {
      setProduct(productList[0].id);
    }
  }, [productList]);

  const entries = isRealUser ? apiEntries : mockEntries;

  const { clickClass, handleClick } = useClickEffect("click-press");
  const canEdit = userRole === "ADMIN" || userRole === "MANAGER";
  const getProd = (id: string) => products.find((p) => p.id === id);

  const handleSubmit = async () => {
    handleClick();
    if (!productId || quantity <= 0) return;

    if (isRealUser) {
      try {
        const res = await api.post("/stock", {
          productId,
          type: tab,
          quantity,
          note,
        });
        setApiEntries((prev) => [res.data, ...prev]);
        dispatch(
          adjustQuantity({
            productId,
            delta: tab === "STOCK_IN" ? quantity : -quantity,
          }),
        );
        setSuccess(
          `${tab === "STOCK_IN" ? "Stocked in" : "Stocked out"} ${quantity} units.`,
        );
      } catch {
        setSuccess("Failed to save. Try again.");
      }
    } else {
      dispatch(
        addStockEntry({
          productId,
          type: tab,
          quantity,
          note,
          performedBy: userName,
        }),
      );
      dispatch(
        adjustQuantity({
          productId,
          delta: tab === "STOCK_IN" ? quantity : -quantity,
        }),
      );
      setSuccess(
        `${tab === "STOCK_IN" ? "Stocked in" : "Stocked out"} ${quantity} units.`,
      );
    }

    setNote("");
    setQuantity(1);
    setTimeout(() => setSuccess(""), 3000);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-5">
        <h1 className="text-xl md:text-2xl font-bold text-white">
          Stock Tracking
        </h1>
        <p className="text-sm mt-1" style={{ color: "#666" }}>
          Log stock in and out movements
        </p>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-3 gap-5">
        {/* Form */}
        {canEdit && (
          <div
            className="md:col-span-1 rounded-xl p-4 md:p-5"
            style={{ background: "#1e1e1e", border: "1px solid #242424" }}
          >
            {/* Tabs */}
            <div
              className="grid grid-cols-2 gap-2 mb-5 p-1 rounded-lg"
              style={{ background: "#242424" }}
            >
              {(["STOCK_IN", "STOCK_OUT"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="py-2 rounded-md text-sm font-medium transition-all"
                  style={{
                    background:
                      tab === t
                        ? t === "STOCK_IN"
                          ? "#10b981"
                          : "#e24815"
                        : "transparent",
                    color: tab === t ? "white" : "#666",
                  }}
                >
                  {t === "STOCK_IN" ? "Stock In" : "Stock Out"}
                </button>
              ))}
            </div>

            {/* Product select */}
            <div className="mb-4">
              <label
                className="text-xs font-medium uppercase tracking-wider mb-1.5 block"
                style={{ color: "#888" }}
              >
                Product
              </label>
              <select
                value={productId}
                onChange={(e) => setProduct(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-white text-sm outline-none"
                style={{ background: "#2a2a2a", border: "1px solid #333" }}
                disabled={isRealUser && !productsLoaded}
              >
                {isRealUser && !productsLoaded && (
                  <option value="">Loading products...</option>
                )}
                {productList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div className="mb-4">
              <label
                className="text-xs font-medium uppercase tracking-wider mb-1.5 block"
                style={{ color: "#888" }}
              >
                Quantity
              </label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-lg text-white text-sm outline-none"
                style={{ background: "#2a2a2a", border: "1px solid #333" }}
              />
            </div>

            {/* Note */}
            <div className="mb-5">
              <label
                className="text-xs font-medium uppercase tracking-wider mb-1.5 block"
                style={{ color: "#888" }}
              >
                Note (optional)
              </label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Monthly restock"
                className="w-full px-3 py-2.5 rounded-lg text-white text-sm outline-none"
                style={{ background: "#2a2a2a", border: "1px solid #333" }}
              />
            </div>

            {/* Performed by */}
            <div className="mb-5">
              <label
                className="text-xs font-medium uppercase tracking-wider mb-1.5 block"
                style={{ color: "#888" }}
              >
                Performed By
              </label>
              <div
                className="w-full px-3 py-2.5 rounded-lg text-sm"
                style={{
                  background: "#242424",
                  color: "#aaa",
                  border: "1px solid #2a2a2a",
                }}
              >
                {userName}
              </div>
            </div>

            {/* Stock preview */}
            {productId && (
              <div
                className="mb-5 p-3 rounded-lg"
                style={{ background: "#242424" }}
              >
                <p className="text-xs" style={{ color: "#666" }}>
                  Current stock
                </p>
                <p className="text-2xl font-bold text-white">
                  {getProd(productId)?.quantity ?? 0}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#555" }}>
                  After:{" "}
                  <span
                    style={{
                      color: tab === "STOCK_IN" ? "#10b981" : "#e24815",
                    }}
                  >
                    {(getProd(productId)?.quantity ?? 0) +
                      (tab === "STOCK_IN" ? quantity : -quantity)}
                  </span>
                </p>
              </div>
            )}

            {success && (
              <p className="text-sm mb-3" style={{ color: "#10b981" }}>
                {success}
              </p>
            )}

            <button
              onClick={handleSubmit}
              className={`w-full py-2.5 rounded-lg text-sm font-semibold text-white ${clickClass}`}
              style={{ background: tab === "STOCK_IN" ? "#10b981" : "#e24815" }}
              disabled={isRealUser && !productsLoaded}
            >
              Confirm {tab === "STOCK_IN" ? "Stock In" : "Stock Out"}
            </button>
          </div>
        )}

        {/* History */}
        <div className={canEdit ? "md:col-span-2" : "md:col-span-3"}>
          {/* Desktop table */}
          <div
            className="hidden md:block rounded-xl overflow-hidden"
            style={{ border: "1px solid #242424" }}
          >
            <div
              className="px-4 py-3"
              style={{
                background: "#1a1a1a",
                borderBottom: "1px solid #242424",
              }}
            >
              <h2 className="text-sm font-semibold text-white">
                Movement History
              </h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr
                  style={{
                    background: "#1a1a1a",
                    borderBottom: "1px solid #222",
                  }}
                >
                  {["Date", "Product", "SKU", "Type", "Qty", "Note", "By"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left font-medium"
                        style={{ color: "#666" }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {entries.map((e, i) => {
                  const prod = {
                    name:
                      (e as any).product?.name ??
                      getProd(e.productId)?.name ??
                      "—",
                    sku:
                      (e as any).product?.sku ??
                      getProd(e.productId)?.sku ??
                      "—",
                  };
                  const isIn = e.type === "STOCK_IN";
                  return (
                    <tr
                      key={e.id}
                      style={{
                        background: i % 2 === 0 ? "#191919" : "#1c1c1c",
                        borderBottom: "1px solid #222",
                      }}
                    >
                      <td className="px-4 py-3" style={{ color: "#666" }}>
                        {new Date(e.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3 text-white">{prod.name}</td>
                      <td className="px-4 py-3" style={{ color: "#888" }}>
                        {prod.sku}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full w-fit"
                          style={{
                            background: isIn ? "#10b98120" : "#e2481520",
                            color: isIn ? "#10b981" : "#e24815",
                          }}
                        >
                          {isIn ? (
                            <TrendingUp size={10} />
                          ) : (
                            <TrendingDown size={10} />
                          )}
                          {isIn ? "IN" : "OUT"}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3 font-semibold"
                        style={{ color: isIn ? "#10b981" : "#e24815" }}
                      >
                        {isIn ? "+" : "-"}
                        {e.quantity}
                      </td>
                      <td className="px-4 py-3" style={{ color: "#666" }}>
                        {e.note || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs px-2 py-0.5 rounded"
                          style={{ background: "#2a2a2a", color: "#aaa" }}
                        >
                          {(e as any).user?.name ??
                            (e as any).performedBy ??
                            "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {entries.length === 0 && (
              <div className="py-12 text-center" style={{ color: "#555" }}>
                <TrendingUp size={28} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm">No stock movements yet.</p>
              </div>
            )}
          </div>

          {/* Mobile cards */}
          <div className="md:hidden">
            <p className="text-sm font-semibold text-white mb-3">
              Movement History
            </p>
            <div className="flex flex-col gap-3">
              {entries.length === 0 ? (
                <div
                  className="py-10 text-center rounded-xl"
                  style={{
                    background: "#1e1e1e",
                    border: "1px solid #242424",
                    color: "#555",
                  }}
                >
                  <TrendingUp size={24} className="mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No stock movements yet.</p>
                </div>
              ) : (
                entries.map((e) => {
                  const prod = {
                    name:
                      (e as any).product?.name ??
                      getProd(e.productId)?.name ??
                      "—",
                    sku:
                      (e as any).product?.sku ??
                      getProd(e.productId)?.sku ??
                      "—",
                  };
                  const isIn = e.type === "STOCK_IN";
                  return (
                    <div
                      key={e.id}
                      className="rounded-xl p-4"
                      style={{
                        background: "#1e1e1e",
                        border: "1px solid #242424",
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{
                              background: isIn ? "#10b98120" : "#e2481520",
                            }}
                          >
                            {isIn ? (
                              <TrendingUp
                                size={14}
                                style={{ color: "#10b981" }}
                              />
                            ) : (
                              <TrendingDown
                                size={14}
                                style={{ color: "#e24815" }}
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">
                              {prod.name}
                            </p>
                            <p className="text-xs" style={{ color: "#666" }}>
                              {prod.sku}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <p
                            className="text-base font-bold"
                            style={{ color: isIn ? "#10b981" : "#e24815" }}
                          >
                            {isIn ? "+" : "-"}
                            {e.quantity}
                          </p>
                          <span
                            className="text-xs px-1.5 py-0.5 rounded"
                            style={{
                              background: isIn ? "#10b98120" : "#e2481520",
                              color: isIn ? "#10b981" : "#e24815",
                            }}
                          >
                            {isIn ? "STOCK IN" : "STOCK OUT"}
                          </span>
                        </div>
                      </div>
                      <div
                        className="flex items-center justify-between text-xs"
                        style={{ color: "#555" }}
                      >
                        <span>{e.note || "No note"}</span>
                        <span>
                          {new Date(e.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="text-xs" style={{ color: "#555" }}>
                          By:
                        </span>
                        <span
                          className="text-xs px-2 py-0.5 rounded"
                          style={{ background: "#2a2a2a", color: "#aaa" }}
                        >
                          {(e as any).user?.name ??
                            (e as any).performedBy ??
                            "—"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockPage;
