import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { mockProducts } from "@/mock/mockData";
import api from "@/services/axiosInstance";

import {
  addProduct,
  updateProduct,
  deleteProduct,
  setProducts,
  fetchProducts,
  createProductThunk,
  updateProductThunk,
  deleteProductThunk,
  type Product,
} from "@/store/productsSlice";

import { mockCategories, mockVendors } from "@/mock/mockData";
import useClickEffect from "@/hooks/useClickEffect";
import { Plus, Pencil, Trash2, Search, X, Package, Eye } from "lucide-react";

const EMPTY: Omit<Product, "id"> = {
  name: "",
  sku: "",
  categoryId: "cat1",
  quantity: 0,
  threshold: 10,
  vendorId: "v1",
  description: "",
  price: 0,
  supplierName: "",
};

const ProductsPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const products = useAppSelector((s) => s.products.items);
  const userRole = useAppSelector((s) => s.auth.user?.role);
  const loading = useAppSelector((s) => s.products.loading);
  const saving = useAppSelector((s) => s.products.saving);
  const apiReady = useAppSelector((s) => s.products.apiReady);
  const token = useAppSelector((s) => s.auth.token);
  const isRealUser = !!token;

  const [search, setSearch] = useState("");
  const [catFilter, setCat] = useState("all");
  const [sort, setSort] = useState("default");
  const [showModal, setShow] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, "id">>(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const allCategories = mockCategories;

  const [dbVendors, setDbVendors] = useState<{ id: string; name: string }[]>(
    [],
  );

  useEffect(() => {
    if (!isRealUser) return; // demo users use mockVendors fallback already
    api
      .get("/vendors")
      .then((res) => setDbVendors(res.data.data))
      .catch(() => {});
  }, [isRealUser]);

  const allVendors = dbVendors.length > 0 ? dbVendors : mockVendors;

  const { clickClass: addCls, handleClick: addClick } =
    useClickEffect("click-press");
  const { clickClass: saveCls, handleClick: saveClick } =
    useClickEffect("click-press");
  const { clickClass: delCls, handleClick: delClick } =
    useClickEffect("click-press");

  const isMock = (id: string) => /^p\d+$/.test(id);

  const getCat = (p: Product) =>
    p.category?.name ??
    mockCategories.find((c) => c.id === p.categoryId)?.name ??
    p.categoryId;
  const getVen = (p: Product) =>
    p.vendor?.name ?? mockVendors.find((v) => v.id === p.vendorId)?.name ?? "—";

  const canEdit = userRole === "ADMIN" || userRole === "MANAGER";
  const canDelete = userRole === "ADMIN";

  const filtered = products.filter((p) => {
    const s = search.toLowerCase();
    return (
      (p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s)) &&
      (catFilter === "all" || p.categoryId === catFilter)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "qty-asc") return a.quantity - b.quantity;
    if (sort === "qty-desc") return b.quantity - a.quantity;
    if (sort === "price-asc") return (a.price ?? 0) - (b.price ?? 0);
    if (sort === "price-desc") return (b.price ?? 0) - (a.price ?? 0);
    return 0;
  });

  const openAdd = () => {
    addClick();
    setEditing(null);
    setForm({
      ...EMPTY,
      categoryId: allCategories[0]?.id ?? "",
      vendorId: allVendors[0]?.id ?? "",
    });
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
      description: p.description ?? "",
      price: p.price ?? 0,
      supplierName: p.supplierName ?? "",
    });
    setShow(true);
  };

  const handleSave = async () => {
    saveClick();
    if (editing && isMock(editing.id)) {
      dispatch(updateProduct({ ...form, id: editing.id }));
      setShow(false);
      return;
    }

    // Strip categoryId — it's optional in DB and mock IDs will cause FK error
    const { categoryId, ...apiForm } = form;

    try {
      if (editing) {
        await dispatch(
          updateProductThunk({ ...apiForm, id: editing.id }),
        ).unwrap();
      } else {
        await dispatch(createProductThunk(apiForm)).unwrap();
      }
      setShow(false);
    } catch {
      if (!apiReady) {
        editing
          ? dispatch(updateProduct({ ...form, id: editing.id }))
          : dispatch(addProduct(form));
        setShow(false);
      }
    }
  };

  const handleDelete = async () => {
    delClick();
    if (!deleteId) return;
    if (isMock(deleteId)) {
      dispatch(deleteProduct(deleteId));
      setDeleteId(null);
      return;
    }
    try {
      await dispatch(deleteProductThunk(deleteId)).unwrap();
    } catch {
      if (!apiReady) dispatch(deleteProduct(deleteId));
    }
    setDeleteId(null);
  };

  // fetch products
  useEffect(() => {
    if (isRealUser) {
      dispatch(fetchProducts());
    } else {
      dispatch(setProducts(mockProducts as Product[]));
    }
  }, [isRealUser, dispatch]);

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

      {/* Filters + Sort */}
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
          {allCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {/* Sort dropdown */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-2.5 rounded-lg text-sm text-white outline-none"
          style={{ background: "#1e1e1e", border: "1px solid #2a2a2a" }}
        >
          <option value="default">Sort By</option>
          <option value="qty-asc">Qty: Low → High</option>
          <option value="qty-desc">Qty: High → Low</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
        </select>
      </div>

      {/* Desktop Table */}
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
                "Price",
                "Qty",
                "Threshold",
                "Supplier",
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
            {sorted.map((p, i) => {
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
                      {getCat(p)}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: "#aaa" }}>
                    {p.price != null && p.price > 0
                      ? `₹${Number(p.price).toFixed(2)}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="font-semibold"
                      style={{ color: isLow ? "#e24815" : "#10b981" }}
                    >
                      {p.quantity}
                    </span>
                    {isLow && (
                      <span
                        className="ml-1.5 text-xs px-1.5 py-0.5 rounded"
                        style={{ background: "#e2481520", color: "#e24815" }}
                      >
                        Low
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3" style={{ color: "#666" }}>
                    {p.threshold}
                  </td>
                  <td className="px-4 py-3" style={{ color: "#888" }}>
                    {p.supplierName || getVen(p)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {/* Detail view button */}
                      <button
                        onClick={() => navigate(`/products/${p.id}`)}
                        className="p-1.5 rounded-lg"
                        style={{ color: "#555", background: "#242424" }}
                        title="View details"
                      >
                        <Eye size={13} />
                      </button>
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
        {sorted.length === 0 && (
          <div className="py-12 text-center" style={{ color: "#555" }}>
            <Package size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No products found.</p>
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-3">
        {sorted.length === 0 ? (
          <div
            className="py-10 text-center rounded-xl"
            style={{
              background: "#1e1e1e",
              border: "1px solid #242424",
              color: "#555",
            }}
          >
            <Package size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No products found.</p>
          </div>
        ) : (
          sorted.map((p) => {
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
                    {/* Detail view button */}
                    <button
                      onClick={() => navigate(`/products/${p.id}`)}
                      className="p-1.5 rounded-lg"
                      style={{ background: "#2a2a2a", color: "#666" }}
                      title="View details"
                    >
                      <Eye size={13} />
                    </button>
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

                {/* Card fields */}
                <div className="gap-4 flex-col flex">
                  {[
                    {
                      label: "Price",
                      value:
                        p.price && Number(p.price) > 0
                          ? `₹${Number(p.price).toFixed(2)}`
                          : "—",
                    },
                    {
                      label: "Supplier",
                      value: p.supplierName || getVen(p),
                    },
                    { label: "Threshold", value: String(p.threshold) },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="px-2 py-1.5 rounded-lg"
                      style={{ background: "#242424" }}
                    >
                      <p className="text-xs mb-0.5" style={{ color: "#555" }}>
                        {label}
                      </p>
                      <p className="text-xs text-white truncate">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Quantity */}
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xs" style={{ color: "#555" }}>
                    Quantity
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-bold"
                      style={{ color: isLow ? "#e24815" : "#10b981" }}
                    >
                      {p.quantity}
                    </span>
                    {isLow && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{ background: "#e2481520", color: "#e24815" }}
                      >
                        Low
                      </span>
                    )}
                  </div>
                </div>

                {/* Description if present */}
                {p.description && (
                  <p
                    className="text-xs mt-2 line-clamp-2"
                    style={{ color: "#555" }}
                  >
                    {p.description}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
            style={{ background: "#1e1e1e", border: "1px solid #2a2a2a" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-lg">
                {editing ? "Edit Product" : "Add Product"}
              </h2>
              <button onClick={() => setShow(false)} style={{ color: "#666" }}>
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Name */}
              <div>
                <label
                  className="text-xs font-medium uppercase tracking-wider mb-1.5 block"
                  style={{ color: "#888" }}
                >
                  Product Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg text-white text-sm outline-none"
                  style={{ background: "#2a2a2a", border: "1px solid #333" }}
                />
              </div>

              {/* SKU */}
              <div>
                <label
                  className="text-xs font-medium uppercase tracking-wider mb-1.5 block"
                  style={{ color: "#888" }}
                >
                  SKU
                </label>
                <input
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg text-white text-sm outline-none"
                  style={{ background: "#2a2a2a", border: "1px solid #333" }}
                />
              </div>

              {/* Category */}
              <div>
                <label
                  className="text-xs font-medium uppercase tracking-wider mb-1.5 block"
                  style={{ color: "#888" }}
                >
                  Category
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm({ ...form, categoryId: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-lg text-white text-sm outline-none"
                  style={{ background: "#2a2a2a", border: "1px solid #333" }}
                >
                  {allCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity + Threshold */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="text-xs font-medium uppercase tracking-wider mb-1.5 block"
                    style={{ color: "#888" }}
                  >
                    Quantity
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.quantity}
                    onChange={(e) =>
                      setForm({ ...form, quantity: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2.5 rounded-lg text-white text-sm outline-none"
                    style={{ background: "#2a2a2a", border: "1px solid #333" }}
                  />
                </div>
                <div>
                  <label
                    className="text-xs font-medium uppercase tracking-wider mb-1.5 block"
                    style={{ color: "#888" }}
                  >
                    Threshold
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.threshold}
                    onChange={(e) =>
                      setForm({ ...form, threshold: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2.5 rounded-lg text-white text-sm outline-none"
                    style={{ background: "#2a2a2a", border: "1px solid #333" }}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  className="text-xs font-medium uppercase tracking-wider mb-1.5 block"
                  style={{ color: "#888" }}
                >
                  Description
                </label>
                <textarea
                  rows={2}
                  value={form.description ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Optional product description"
                  className="w-full px-3 py-2.5 rounded-lg text-white text-sm outline-none resize-none"
                  style={{ background: "#2a2a2a", border: "1px solid #333" }}
                />
              </div>

              {/* Price */}
              <div>
                <label
                  className="text-xs font-medium uppercase tracking-wider mb-1.5 block"
                  style={{ color: "#888" }}
                >
                  Price (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.price ?? 0}
                  onChange={(e) =>
                    setForm({ ...form, price: parseFloat(e.target.value) })
                  }
                  className="w-full px-3 py-2.5 rounded-lg text-white text-sm outline-none"
                  style={{ background: "#2a2a2a", border: "1px solid #333" }}
                />
              </div>

              {/* Supplier Name */}
              <div>
                <label
                  className="text-xs font-medium uppercase tracking-wider mb-1.5 block"
                  style={{ color: "#888" }}
                >
                  Supplier Name
                </label>
                <input
                  type="text"
                  value={form.supplierName ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, supplierName: e.target.value })
                  }
                  placeholder="e.g. TechSupply Co."
                  className="w-full px-3 py-2.5 rounded-lg text-white text-sm outline-none"
                  style={{ background: "#2a2a2a", border: "1px solid #333" }}
                />
              </div>

              {/* Vendor */}
              <div>
                <label
                  className="text-xs font-medium uppercase tracking-wider mb-1.5 block"
                  style={{ color: "#888" }}
                >
                  Vendor
                </label>
                <select
                  value={form.vendorId ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, vendorId: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-lg text-white text-sm outline-none"
                  style={{ background: "#2a2a2a", border: "1px solid #333" }}
                >
                  <option value="">No vendor</option>
                  {allVendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
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
                {editing ? "Update" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6"
            style={{ background: "#1e1e1e", border: "1px solid #2a2a2a" }}
          >
            <h2 className="text-white font-bold text-lg mb-2">
              Delete Product?
            </h2>
            <p className="text-sm mb-6" style={{ color: "#666" }}>
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
