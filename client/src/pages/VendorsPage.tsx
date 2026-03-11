import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { addVendor, addPurchaseEntry } from "../store/vendorSlice";
import type { Vendor, PurchaseEntry } from "../store/vendorSlice";
import useClickEffect from "@/hooks/useClickEffect";
import api from "@/services/axiosInstance";
import {
  Plus,
  X,
  Truck,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  Loader2,
} from "lucide-react";

const VendorsPage = () => {
  const dispatch = useAppDispatch();
  const userRole = useAppSelector((s) => s.auth.user?.role);
  const token = useAppSelector((s) => s.auth.token);
  const isRealUser = !!token; // 👈 the switch

  // — Mock data from Redux
  const mockVendors = useAppSelector((s) => s.vendors.vendors);
  const mockPurchases = useAppSelector((s) => s.vendors.purchases);

  // — Real API data in local state
  const [apiVendors, setApiVendors] = useState<Vendor[]>([]);
  const [apiPurchases, setApiPurchases] = useState<PurchaseEntry[]>([]);
  const [loadingV, setLoadingV] = useState(false);
  const [loadingP, setLoadingP] = useState(false);
  const [vError, setVError] = useState("");
  const [pError, setPError] = useState("");

  // — Unified source depending on user type
  const vendors = isRealUser ? apiVendors : mockVendors;
  const purchases = isRealUser ? apiPurchases : mockPurchases;

  const [selectedId, setSelectedId] = useState("");
  const [mobileDetail, setMobileDetail] = useState(false);
  const [showVModal, setShowVModal] = useState(false);
  const [showPModal, setShowPModal] = useState(false);
  const [vForm, setVForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [pForm, setPForm] = useState({ amount: 0, note: "" });

  const { clickClass: addVC, handleClick: addVClick } =
    useClickEffect("click-press");
  const { clickClass: addPC, handleClick: addPClick } =
    useClickEffect("click-press");
  const { clickClass: saveVC, handleClick: saveVClick } =
    useClickEffect("click-press");
  const { clickClass: savePCls, handleClick: savePClick } =
    useClickEffect("click-press");

  const canEdit = userRole === "ADMIN" || userRole === "MANAGER";
  const isAdmin = userRole === "ADMIN";

  const isMockVendor = (id: string) => /^v\d+$/.test(id);

  const selectedVendor = vendors.find((v) => v.id === selectedId);
  const vendorPurchases = purchases.filter((p) => p.vendorId === selectedId);
  const totalSpend = vendorPurchases.reduce((a, b) => a + b.amount, 0);

  // — Set initial selectedId from mock data
  useEffect(() => {
    if (!isRealUser && mockVendors.length > 0 && !selectedId) {
      setSelectedId(mockVendors[0].id);
    }
  }, [isRealUser, mockVendors]);

  // — Fetch real vendors on mount
  useEffect(() => {
    if (!isRealUser) return;
    const fetch = async () => {
      try {
        setLoadingV(true);
        const res = await api.get("/vendors");
        const list = res.data.data;
        setApiVendors(list);
        // Inject vendorId into each purchase before flattening
        const allPurchases = list.flatMap(
          (v: any) =>
            (v.purchases ?? []).map((p: any) => ({ ...p, vendorId: v.id })), // 👈
        );
        setApiPurchases(allPurchases);
        if (list.length > 0) setSelectedId(list[0].id);
      } catch (err) {
        console.error("Failed to fetch vendors", err);
      } finally {
        setLoadingV(false);
      }
    };
    fetch();
  }, [isRealUser]);

  // — Fetch real purchases when selectedId changes
  useEffect(() => {
    if (!isRealUser || !selectedId) return;
    if (isMockVendor(selectedId)) return;
    const fetch = async () => {
      try {
        setLoadingP(true);
        const res = await api.get(`/vendors/${selectedId}/purchases`);
        const entries: PurchaseEntry[] = res.data.data;
        setApiPurchases((prev) => [
          ...prev.filter((p) => p.vendorId !== selectedId),
          ...entries,
        ]);
      } catch (err) {
        console.error("Failed to fetch purchases", err);
      } finally {
        setLoadingP(false);
      }
    };
    fetch();
  }, [isRealUser, selectedId]);

  // — Add vendor
  const handleAddVendor = async () => {
    saveVClick();
    if (!vForm.name.trim()) {
      setVError("Vendor name is required");
      return;
    }
    setVError("");

    if (!isRealUser) {
      // Mock path
      dispatch(addVendor(vForm));
      setShowVModal(false);
      setVForm({ name: "", email: "", phone: "", address: "" });
      return;
    }

    // Real API path
    try {
      const res = await api.post("/vendors", vForm);
      const newVendor: Vendor = res.data.data;
      setApiVendors((prev) => [newVendor, ...prev]);
      setSelectedId(newVendor.id);
      setShowVModal(false);
      setVForm({ name: "", email: "", phone: "", address: "" });
    } catch (err: any) {
      setVError(err.response?.data?.message ?? "Failed to create vendor");
    }
  };

  // — Add purchase
  const handleAddPurchase = async () => {
    savePClick();
    if (!pForm.amount || pForm.amount <= 0) {
      setPError("Enter a valid amount");
      return;
    }
    setPError("");

    if (!isRealUser) {
      // Mock path
      dispatch(
        addPurchaseEntry({
          vendorId: selectedId,
          amount: pForm.amount,
          note: pForm.note,
        }),
      );
      setShowPModal(false);
      setPForm({ amount: 0, note: "" });
      return;
    }

    // If real user selected a mock vendor → local only
    if (isMockVendor(selectedId)) {
      dispatch(
        addPurchaseEntry({
          vendorId: selectedId,
          amount: pForm.amount,
          note: pForm.note,
        }),
      );
      setShowPModal(false);
      setPForm({ amount: 0, note: "" });
      return;
    }

    // Real API path
    try {
      const res = await api.post(`/vendors/${selectedId}/purchases`, pForm);
      const newEntry: PurchaseEntry = res.data.data;
      setApiPurchases((prev) => [newEntry, ...prev]);
      setShowPModal(false);
      setPForm({ amount: 0, note: "" });
    } catch (err: any) {
      setPError(err.response?.data?.message ?? "Failed to add purchase");
    }
  };

  if (loadingV) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2
          size={28}
          className="animate-spin"
          style={{ color: "#e24815" }}
        />
      </div>
    );
  }

  return (
    <div
      className="flex h-[calc(100vh-64px)] overflow-hidden"
      style={{ background: "#191818" }}
    >
      {/* ── LEFT: Vendor List ── */}
      <div
        className={`flex flex-col border-r ${mobileDetail ? "hidden md:flex" : "flex"} w-full md:w-72 lg:w-80 flex-shrink-0`}
        style={{ borderColor: "#2a2a2a" }}
      >
        <div
          className="p-4 border-b flex items-center justify-between"
          style={{ borderColor: "#2a2a2a" }}
        >
          <div>
            <h1 className="text-white font-bold text-lg">Vendors</h1>
            <p className="text-xs" style={{ color: "#666" }}>
              {vendors.length} vendors registered
              {isRealUser && (
                <span className="ml-1.5 text-green-500">● live</span>
              )}
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => {
                addVClick();
                setShowVModal(true);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white ${addVC}`}
              style={{ background: "#e24815" }}
            >
              <Plus size={14} /> Add
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {vendors.length === 0 ? (
            <p className="text-center text-sm mt-10" style={{ color: "#555" }}>
              No vendors yet
            </p>
          ) : (
            vendors.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  setSelectedId(v.id);
                  setMobileDetail(true);
                }}
                className="w-full text-left px-4 py-3 border-b flex items-center justify-between transition-colors"
                style={{
                  borderColor: "#2a2a2a",
                  background: selectedId === v.id ? "#242424" : "transparent",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "#2a2a2a" }}
                  >
                    <Truck size={16} style={{ color: "#e24815" }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{v.name}</p>
                    <p className="text-xs" style={{ color: "#555" }}>
                      {isRealUser && !isMockVendor(v.id)
                        ? `${(v as any)._count?.purchases ?? 0} purchases`
                        : `${purchases.filter((p) => p.vendorId === v.id).length} purchases`}
                    </p>
                  </div>
                </div>
                <ChevronRight size={14} style={{ color: "#444" }} />
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── RIGHT: Vendor Detail ── */}
      <div
        className={`flex-1 flex flex-col overflow-hidden ${mobileDetail ? "flex" : "hidden md:flex"}`}
      >
        {!selectedVendor ? (
          <div className="flex items-center justify-center h-full">
            <p style={{ color: "#444" }}>Select a vendor</p>
          </div>
        ) : (
          <>
            <div
              className="p-5 border-b flex items-start justify-between flex-col gap-8 "
              style={{ borderColor: "#2a2a2a" }}
            >
              <div>
                <button
                  className="text-xs mb-2 md:hidden"
                  style={{ color: "#666" }}
                  onClick={() => setMobileDetail(false)}
                >
                  ← Back
                </button>
                <h2 className="text-white font-bold text-xl pt-4">
                  {selectedVendor.name}
                </h2>
                <div className="flex flex-wrap gap-3 mt-2">
                  {selectedVendor.email && (
                    <span
                      className="flex items-center gap-1 text-xs"
                      style={{ color: "#666" }}
                    >
                      <Mail size={11} /> {selectedVendor.email}
                    </span>
                  )}
                  {selectedVendor.phone && (
                    <span
                      className="flex items-center gap-1 text-xs"
                      style={{ color: "#666" }}
                    >
                      <Phone size={11} /> {selectedVendor.phone}
                    </span>
                  )}
                  {selectedVendor.address && (
                    <span
                      className="flex items-center gap-1 text-xs"
                      style={{ color: "#666" }}
                    >
                      <MapPin size={11} /> {selectedVendor.address}
                    </span>
                  )}
                </div>
              </div>
              {canEdit && (
                <button
                  onClick={() => {
                    addPClick();
                    setShowPModal(true);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white ${addPC}`}
                  style={{ background: "#2a2a2a", border: "1px solid #333" }}
                >
                  <Plus size={14} /> Add Purchase
                </button>
              )}
            </div>

            {/* Stats */}
            <div
              className="grid grid-cols-2 gap-3 p-5 border-b"
              style={{ borderColor: "#2a2a2a" }}
            >
              <div
                className="rounded-xl p-4"
                style={{ background: "#1e1e1e", border: "1px solid #2a2a2a" }}
              >
                <p className="text-xs mb-1" style={{ color: "#666" }}>
                  Total Purchases
                </p>
                <p className="text-2xl font-bold text-white">
                  {vendorPurchases.length}
                </p>
              </div>
              <div
                className="rounded-xl p-4"
                style={{ background: "#1e1e1e", border: "1px solid #2a2a2a" }}
              >
                <p className="text-xs mb-1" style={{ color: "#666" }}>
                  Total Spend
                </p>
                <p className="text-2xl font-bold" style={{ color: "#e24815" }}>
                  ₹{totalSpend.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* Purchase List */}
            <div className="flex-1 overflow-y-auto p-5">
              <h3 className="text-sm font-semibold text-white mb-3">
                Purchase Entries
              </h3>
              {loadingP ? (
                <div className="flex justify-center mt-8">
                  <Loader2
                    size={20}
                    className="animate-spin"
                    style={{ color: "#555" }}
                  />
                </div>
              ) : vendorPurchases.length === 0 ? (
                <p
                  className="text-sm text-center mt-8"
                  style={{ color: "#444" }}
                >
                  No purchases yet
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {vendorPurchases.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-xl p-4 flex items-center justify-between"
                      style={{
                        background: "#1e1e1e",
                        border: "1px solid #2a2a2a",
                      }}
                    >
                      <div>
                        <p className="text-sm font-medium text-white">
                          ₹{p.amount.toLocaleString("en-IN")}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "#555" }}>
                          {p.note || "No note"}
                        </p>
                      </div>
                      <p className="text-xs" style={{ color: "#555" }}>
                        {new Date(p.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "2-digit",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Modal: Add Vendor ── */}
      {showVModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6"
            style={{ background: "#1e1e1e", border: "1px solid #2a2a2a" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg">Add Vendor</h3>
              <button
                onClick={() => {
                  setShowVModal(false);
                  setVError("");
                }}
                style={{ color: "#666" }}
              >
                <X size={18} />
              </button>
            </div>
            {(["name", "email", "phone", "address"] as const).map((field) => (
              <div key={field} className="mb-3">
                <label
                  className="text-xs font-medium uppercase tracking-wider mb-1.5 block"
                  style={{ color: "#888" }}
                >
                  {field}
                  {field === "name" && " *"}
                </label>
                <input
                  value={vForm[field]}
                  onChange={(e) =>
                    setVForm((f) => ({ ...f, [field]: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-lg text-white text-sm outline-none"
                  style={{ background: "#2a2a2a", border: "1px solid #333" }}
                  placeholder={field === "name" ? "Required" : "Optional"}
                />
              </div>
            ))}
            {vError && <p className="text-red-400 text-xs mb-3">{vError}</p>}
            <button
              onClick={handleAddVendor}
              className={`w-full py-3 rounded-lg font-semibold text-white text-sm mt-2 ${saveVC}`}
              style={{ background: "#e24815" }}
            >
              Save Vendor
            </button>
          </div>
        </div>
      )}

      {/* ── Modal: Add Purchase ── */}
      {showPModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6"
            style={{ background: "#1e1e1e", border: "1px solid #2a2a2a" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg">Add Purchase</h3>
              <button
                onClick={() => {
                  setShowPModal(false);
                  setPError("");
                }}
                style={{ color: "#666" }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="mb-3">
              <label
                className="text-xs font-medium uppercase tracking-wider mb-1.5 block"
                style={{ color: "#888" }}
              >
                Amount (₹) *
              </label>
              <input
                type="number"
                value={pForm.amount || ""}
                onChange={(e) =>
                  setPForm((f) => ({ ...f, amount: Number(e.target.value) }))
                }
                className="w-full px-4 py-3 rounded-lg text-white text-sm outline-none"
                style={{ background: "#2a2a2a", border: "1px solid #333" }}
                placeholder="e.g. 45000"
              />
            </div>
            <div className="mb-4">
              <label
                className="text-xs font-medium uppercase tracking-wider mb-1.5 block"
                style={{ color: "#888" }}
              >
                Note
              </label>
              <input
                value={pForm.note}
                onChange={(e) =>
                  setPForm((f) => ({ ...f, note: e.target.value }))
                }
                className="w-full px-4 py-3 rounded-lg text-white text-sm outline-none"
                style={{ background: "#2a2a2a", border: "1px solid #333" }}
                placeholder="Optional"
              />
            </div>
            {pError && <p className="text-red-400 text-xs mb-3">{pError}</p>}
            <button
              onClick={handleAddPurchase}
              className={`w-full py-3 rounded-lg font-semibold text-white text-sm ${savePCls}`}
              style={{ background: "#e24815" }}
            >
              Save Purchase
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorsPage;
