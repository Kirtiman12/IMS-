import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  addProduct,
  updateProduct,
  deleteProduct,
  type Product,
} from "../features/products/productsSlice";
import { mockCategories, mockVendors } from "@/mock/mockData";
import useClickEffect from "@/hooks/useClickEffect";
import { Plus, Pencil, Trash2, Search, X, Package } from "lucide-react";

const EMPTY: Omit<Product, "id"> = {
  name: "",
  sku: "",
  categoryId: "cat1",
  quantity: 0,
  threshold: 10,
  vendorId: "v1",
};

const ProductsPage = () => {
  const dispatch = useAppDispatch();
  const products = useAppSelector((s) => s.products.items);
  const userRole = useAppSelector((s) => s.auth.user?.role);

  const [search, setSearch] = useState("");
  const [catFilter, setCat] = useState("all");
  const [showModal, setShow] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, "id">>(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { clickClass: addCls, handleClick: addClick } =
    useClickEffect("click-press");
  const { clickClass: saveCls, handleClick: saveClick } =
    useClickEffect("click-press");
  const { clickClass: delCls, handleClick: delClick } =
    useClickEffect("click-press");

  const getCat = (id: string) =>
    mockCategories.find((c) => c.id === id)?.name ?? id;
  const getVen = (id: string | null) =>
    mockVendors.find((v) => v.id === id)?.name ?? "—";
  const canEdit = userRole === "ADMIN" || userRole === "MANAGER";
  const canDelete = userRole === "ADMIN";

  const filtered = products.filter((p) => {
    const s = search.toLowerCase();
    return (
      (p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s)) &&
      (catFilter === "all" || p.categoryId === catFilter)
    );
  });

  const openAdd = () => {
    addClick();
    setEditing(null);
    setForm(EMPTY);
    setShow(true);
  };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      sku: p.sku,
      categoryId: p.categoryId,
      quantity: p.quantity,
      threshold: p.threshold,
      vendorId: p.vendorId,
    });
    setShow(true);
  };
  const handleSave = () => {
    saveClick();
    editing
      ? dispatch(updateProduct({ ...form, id: editing.id }))
      : dispatch(addProduct(form));
    setShow(false);
  };
  const handleDelete = () => {
    delClick();
    if (deleteId) dispatch(deleteProduct(deleteId));
    setDeleteId(null);
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Products</h1>
          <p className="text-sm mt-0.5" style={{ color: "#666" }}>
            {products.length} total products
          </p>
        </div>
        {canEdit && (
          <button
            onClick={openAdd}
            className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-sm font-semibold text-white ${addCls}`}
            style={{ background: "#e24815" }}
          >
            <Plus size={15} />
            <span className="hidden xs:inline">Add Product</span>
            <span className="xs:hidden">Add</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col xs:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "#555" }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SKU..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm text-white outline-none"
            style={{ background: "#1e1e1e", border: "1px solid #2a2a2a" }}
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => setCat(e.target.value)}
          className="px-3 py-2.5 rounded-lg text-sm text-white outline-none"
          style={{ background: "#1e1e1e", border: "1px solid #2a2a2a" }}
        >
          <option value="all">All Categories</option>
          {mockCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop table — hidden below md */}
      <div
        className="hidden md:block rounded-xl overflow-hidden"
        style={{ border: "1px solid #242424" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr
              style={{
                background: "#1a1a1a",
                borderBottom: "1px solid #242424",
              }}
            >
              {[
                "Product",
                "SKU",
                "Category",
                "Qty",
                "Threshold",
                "Vendor",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left font-medium"
                  style={{ color: "#666" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => {
              const isLow = p.quantity <= p.threshold;
              return (
                <tr
                  key={p.id}
                  style={{
                    background: i % 2 === 0 ? "#191919" : "#1c1c1c",
                    borderBottom: "1px solid #222",
                  }}
                >
                  <td className="px-4 py-3 text-white font-medium">{p.name}</td>
                  <td className="px-4 py-3" style={{ color: "#888" }}>
                    {p.sku}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-0.5 rounded text-xs"
                      style={{ background: "#2a2a2a", color: "#aaa" }}
                    >
                      {getCat(p.categoryId)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="font-semibold"
                      style={{ color: isLow ? "#e24815" : "#10b981" }}
                    >
                      {p.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: "#666" }}>
                    {p.threshold}
                  </td>
                  <td className="px-4 py-3" style={{ color: "#888" }}>
                    {getVen(p.vendorId)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {canEdit && (
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 rounded-lg"
                          style={{ color: "#555", background: "#242424" }}
                        >
                          <Pencil size={13} />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="p-1.5 rounded-lg"
                          style={{ color: "#555", background: "#242424" }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm" style={{ color: "#555" }}>
            No products found.
          </div>
        )}
      </div>

      {/* Mobile cards — shown below md */}
      <div className="md:hidden flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div
            className="py-10 text-center rounded-xl"
            style={{
              background: "#1e1e1e",
              border: "1px solid #242424",
              color: "#555",
            }}
          >
            No products found.
          </div>
        ) : (
          filtered.map((p) => {
            const isLow = p.quantity <= p.threshold;
            return (
              <div
                key={p.id}
                className="rounded-xl p-4"
                style={{
                  background: "#1e1e1e",
                  border: `1px solid ${isLow ? "#e2481540" : "#242424"}`,
                }}
              >
                {/* Card header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 mr-2">
                    <p className="text-white font-semibold text-sm truncate">
                      {p.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#666" }}>
                      {p.sku}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {canEdit && (
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 rounded-lg"
                        style={{ background: "#2a2a2a", color: "#666" }}
                      >
                        <Pencil size={13} />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => setDeleteId(p.id)}
                        className="p-1.5 rounded-lg"
                        style={{ background: "#2a2a2a", color: "#666" }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Card fields grid */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Category", value: getCat(p.categoryId) },
                    { label: "Vendor", value: getVen(p.vendorId) },
                    { label: "Threshold", value: p.threshold },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="px-3 py-2 rounded-lg"
                      style={{ background: "#242424" }}
                    >
                      <p className="text-xs mb-0.5" style={{ color: "#555" }}>
                        {label}
                      </p>
                      <p className="text-sm text-white">{value}</p>
                    </div>
                  ))}

                  {/* Quantity with badge */}
                  <div
                    className="px-3 py-2 rounded-lg"
                    style={{ background: isLow ? "#e2481515" : "#242424" }}
                  >
                    <p className="text-xs mb-0.5" style={{ color: "#555" }}>
                      Quantity
                    </p>
                    <p
                      className="text-sm font-bold"
                      style={{ color: isLow ? "#e24815" : "#10b981" }}
                    >
                      {p.quantity}
                      {isLow && (
                        <span className="ml-1 text-xs font-normal">(Low)</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end xs:items-center justify-center"
          style={{ background: "#000000bb" }}
        >
          <div
            className="w-full xs:max-w-md p-5 xs:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto scrollbar-hide"
            style={{ background: "#1e1e1e", border: "1px solid #2a2a2a" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">
                {editing ? "Edit Product" : "Add Product"}
              </h2>
              <button onClick={() => setShow(false)} style={{ color: "#666" }}>
                <X size={18} />
              </button>
            </div>

            {[
              { label: "Product Name", key: "name", type: "text" },
              { label: "SKU", key: "sku", type: "text" },
              { label: "Quantity", key: "quantity", type: "number" },
              {
                label: "Low Stock Threshold",
                key: "threshold",
                type: "number",
              },
            ].map(({ label, key, type }) => (
              <div key={key} className="mb-4">
                <label
                  className="text-xs font-medium uppercase tracking-wider mb-1.5 block"
                  style={{ color: "#888" }}
                >
                  {label}
                </label>
                <input
                  type={type}
                  value={(form as any)[key]}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      [key]:
                        type === "number"
                          ? Number(e.target.value)
                          : e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2.5 rounded-lg text-white text-sm outline-none"
                  style={{ background: "#2a2a2a", border: "1px solid #333" }}
                />
              </div>
            ))}

            <div className="mb-4">
              <label
                className="text-xs font-medium uppercase tracking-wider mb-1.5 block"
                style={{ color: "#888" }}
              >
                Category
              </label>
              <select
                value={form.categoryId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, categoryId: e.target.value }))
                }
                className="w-full px-3 py-2.5 rounded-lg text-white text-sm outline-none"
                style={{ background: "#2a2a2a", border: "1px solid #333" }}
              >
                {mockCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label
                className="text-xs font-medium uppercase tracking-wider mb-1.5 block"
                style={{ color: "#888" }}
              >
                Vendor
              </label>
              <select
                value={form.vendorId ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, vendorId: e.target.value }))
                }
                className="w-full px-3 py-2.5 rounded-lg text-white text-sm outline-none"
                style={{ background: "#2a2a2a", border: "1px solid #333" }}
              >
                {mockVendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShow(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                style={{ background: "#2a2a2a", color: "#888" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold text-white ${saveCls}`}
                style={{ background: "#e24815" }}
              >
                {editing ? "Save Changes" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "#000000bb" }}
        >
          <div
            className="w-full max-w-sm p-6 rounded-2xl"
            style={{ background: "#1e1e1e", border: "1px solid #2a2a2a" }}
          >
            <h2 className="text-lg font-bold text-white mb-2">
              Delete Product?
            </h2>
            <p className="text-sm mb-6" style={{ color: "#888" }}>
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                style={{ background: "#2a2a2a", color: "#888" }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold text-white ${delCls}`}
                style={{ background: "#e24815" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
