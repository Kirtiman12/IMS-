import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { addVendor, addPurchaseEntry } from "../features/vendors/vendorSlice";
import useClickEffect from "@/hooks/useClickEffect";
import {
  Plus,
  X,
  Truck,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
} from "lucide-react";

const VendorsPage = () => {
  const dispatch = useAppDispatch();
  const vendors = useAppSelector((s) => s.vendors.vendors);
  const purchases = useAppSelector((s) => s.vendors.purchases);
  const userRole = useAppSelector((s) => s.auth.user?.role);

  const [selectedId, setSelectedId] = useState(vendors[0]?.id ?? "");
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

  const selectedVendor = vendors.find((v) => v.id === selectedId);
  const vendorPurchases = purchases.filter((p) => p.vendorId === selectedId);
  const totalSpend = vendorPurchases.reduce((a, b) => a + b.amount, 0);

  const handleAddVendor = () => {
    saveVClick();
    dispatch(addVendor(vForm));
    setShowVModal(false);
    setVForm({ name: "", email: "", phone: "", address: "" });
  };
  const handleAddPurchase = () => {
    savePClick();
    dispatch(
      addPurchaseEntry({
        vendorId: selectedId,
        amount: pForm.amount,
        note: pForm.note,
      }),
    );
    setShowPModal(false);
    setPForm({ amount: 0, note: "" });
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Vendors</h1>
          <p className="text-sm mt-0.5" style={{ color: "#666" }}>
            {vendors.length} vendors registered
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              addVClick();
              setShowVModal(true);
            }}
            className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-sm font-semibold text-white ${addVC}`}
            style={{ background: "#e24815" }}
          >
            <Plus size={15} />
            <span className="hidden xs:inline">Add Vendor</span>
            <span className="xs:hidden">Add</span>
          </button>
        )}
      </div>

      {/* Desktop layout: 2-col */}
      <div className="hidden md:grid md:grid-cols-3 gap-5">
        {/* Vendor list */}
        <div className="flex flex-col gap-2">
          {vendors.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedId(v.id)}
              className="w-full text-left p-4 rounded-xl transition-all"
              style={{
                background: selectedId === v.id ? "#e2481515" : "#1e1e1e",
                border: `1px solid ${selectedId === v.id ? "#e24815" : "#242424"}`,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                  style={{ background: "#2a2a2a" }}
                >
                  {v.name[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {v.name}
                  </p>
                  <p className="text-xs truncate" style={{ color: "#666" }}>
                    {v.email}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Vendor detail */}
        <div className="col-span-2">
          <VendorDetail
            vendor={selectedVendor}
            purchases={vendorPurchases}
            totalSpend={totalSpend}
            canEdit={canEdit}
            onAddPurchase={() => {
              addPClick();
              setShowPModal(true);
            }}
            addPCls={addPC}
          />
        </div>
      </div>

      {/* Mobile layout: list → tap → detail view */}
      <div className="md:hidden">
        {!mobileDetail ? (
          <div className="flex flex-col gap-3">
            {vendors.map((v) => {
              const vPurchases = purchases.filter((p) => p.vendorId === v.id);
              const vTotal = vPurchases.reduce((a, b) => a + b.amount, 0);
              return (
                <button
                  key={v.id}
                  onClick={() => {
                    setSelectedId(v.id);
                    setMobileDetail(true);
                  }}
                  className="w-full text-left p-4 rounded-xl"
                  style={{ background: "#1e1e1e", border: "1px solid #242424" }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                        style={{ background: "#2a2a2a" }}
                      >
                        {v.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-semibold truncate">
                          {v.name}
                        </p>
                        <p
                          className="text-xs truncate"
                          style={{ color: "#666" }}
                        >
                          {vPurchases.length} purchases · ₹
                          {vTotal.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={16} style={{ color: "#555" }} />
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div>
            <button
              onClick={() => setMobileDetail(false)}
              className="flex items-center gap-2 mb-4 text-sm"
              style={{ color: "#888" }}
            >
              ← Back to vendors
            </button>
            <VendorDetail
              vendor={selectedVendor}
              purchases={vendorPurchases}
              totalSpend={totalSpend}
              canEdit={canEdit}
              onAddPurchase={() => {
                addPClick();
                setShowPModal(true);
              }}
              addPCls={addPC}
            />
          </div>
        )}
      </div>

      {/* Add Vendor Modal */}
      {showVModal && (
        <div
          className="fixed inset-0 z-50 flex items-end xs:items-center justify-center"
          style={{ background: "#000000bb" }}
        >
          <div
            className="w-full xs:max-w-md p-5 xs:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto scrollbar-hide"
            style={{ background: "#1e1e1e", border: "1px solid #2a2a2a" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">Add Vendor</h2>
              <button
                onClick={() => setShowVModal(false)}
                style={{ color: "#666" }}
              >
                <X size={18} />
              </button>
            </div>
            {[
              { label: "Vendor Name", key: "name" },
              { label: "Email", key: "email" },
              { label: "Phone", key: "phone" },
              { label: "Address", key: "address" },
            ].map(({ label, key }) => (
              <div key={key} className="mb-4">
                <label
                  className="text-xs font-medium uppercase tracking-wider mb-1.5 block"
                  style={{ color: "#888" }}
                >
                  {label}
                </label>
                <input
                  value={(vForm as any)[key]}
                  onChange={(e) =>
                    setVForm((f) => ({ ...f, [key]: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 rounded-lg text-white text-sm outline-none"
                  style={{ background: "#2a2a2a", border: "1px solid #333" }}
                />
              </div>
            ))}
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setShowVModal(false)}
                className="flex-1 py-2.5 rounded-lg text-sm"
                style={{ background: "#2a2a2a", color: "#888" }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddVendor}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold text-white ${saveVC}`}
                style={{ background: "#e24815" }}
              >
                Add Vendor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Purchase Modal */}
      {showPModal && (
        <div
          className="fixed inset-0 z-50 flex items-end xs:items-center justify-center"
          style={{ background: "#000000bb" }}
        >
          <div
            className="w-full xs:max-w-sm p-5 xs:rounded-2xl rounded-t-2xl"
            style={{ background: "#1e1e1e", border: "1px solid #2a2a2a" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">
                Add Purchase Entry
              </h2>
              <button
                onClick={() => setShowPModal(false)}
                style={{ color: "#666" }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="mb-4">
              <label
                className="text-xs font-medium uppercase tracking-wider mb-1.5 block"
                style={{ color: "#888" }}
              >
                Amount (₹)
              </label>
              <input
                type="number"
                value={pForm.amount}
                onChange={(e) =>
                  setPForm((f) => ({ ...f, amount: Number(e.target.value) }))
                }
                className="w-full px-3 py-2.5 rounded-lg text-white text-sm outline-none"
                style={{ background: "#2a2a2a", border: "1px solid #333" }}
              />
            </div>
            <div className="mb-6">
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
                className="w-full px-3 py-2.5 rounded-lg text-white text-sm outline-none"
                style={{ background: "#2a2a2a", border: "1px solid #333" }}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPModal(false)}
                className="flex-1 py-2.5 rounded-lg text-sm"
                style={{ background: "#2a2a2a", color: "#888" }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddPurchase}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold text-white ${savePCls}`}
                style={{ background: "#e24815" }}
              >
                Add Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Shared Vendor Detail component ──────────────────────── */
type Vendor = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
};
type Purchase = {
  id: string;
  vendorId: string;
  amount: number;
  note: string;
  createdAt: string;
};

const VendorDetail = ({
  vendor,
  purchases,
  totalSpend,
  canEdit,
  onAddPurchase,
  addPCls,
}: {
  vendor?: Vendor;
  purchases: Purchase[];
  totalSpend: number;
  canEdit: boolean;
  onAddPurchase: () => void;
  addPCls: string;
}) => {
  if (!vendor)
    return (
      <div
        className="flex items-center justify-center h-40 rounded-xl"
        style={{ background: "#1e1e1e", border: "1px solid #242424" }}
      >
        <p style={{ color: "#555" }}>Select a vendor</p>
      </div>
    );

  return (
    <>
      {/* Info card */}
      <div
        className="rounded-xl p-4 md:p-5 mb-4"
        style={{ background: "#1e1e1e", border: "1px solid #242424" }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center"
              style={{ background: "#e2481520", border: "1px solid #e2481540" }}
            >
              <Truck size={20} style={{ color: "#e24815" }} />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-white">
                {vendor.name}
              </h2>
              <p className="text-xs md:text-sm" style={{ color: "#666" }}>
                {purchases.length} purchases · ₹
                {totalSpend.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
          {canEdit && (
            <button
              onClick={onAddPurchase}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs md:text-sm font-medium text-white ${addPCls}`}
              style={{ background: "#2a2a2a" }}
            >
              <Plus size={13} /> Add Purchase
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-3 gap-2">
          {[
            { icon: Mail, label: vendor.email },
            { icon: Phone, label: vendor.phone },
            { icon: MapPin, label: vendor.address },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ background: "#242424" }}
            >
              <Icon size={13} style={{ color: "#555" }} className="shrink-0" />
              <span className="text-xs text-white truncate">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Purchase entries — table on desktop, cards on mobile */}
      <div
        className="hidden md:block rounded-xl overflow-hidden"
        style={{ border: "1px solid #242424" }}
      >
        <div
          className="px-4 py-3"
          style={{ background: "#1a1a1a", borderBottom: "1px solid #242424" }}
        >
          <h3 className="text-sm font-semibold text-white">Purchase Entries</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr
              style={{ background: "#1a1a1a", borderBottom: "1px solid #222" }}
            >
              {["Date", "Amount (₹)", "Note"].map((h) => (
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
            {purchases.map((p, i) => (
              <tr
                key={p.id}
                style={{
                  background: i % 2 === 0 ? "#191919" : "#1c1c1c",
                  borderBottom: "1px solid #222",
                }}
              >
                <td className="px-4 py-3" style={{ color: "#777" }}>
                  {new Date(p.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "2-digit",
                  })}
                </td>
                <td className="px-4 py-3 font-semibold text-white">
                  ₹{p.amount.toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3" style={{ color: "#777" }}>
                  {p.note || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {purchases.length === 0 && (
          <div className="py-10 text-center text-sm" style={{ color: "#555" }}>
            No purchase entries yet.
          </div>
        )}
      </div>

      {/* Mobile purchase cards */}
      <div className="md:hidden">
        <p className="text-sm font-semibold text-white mb-3">
          Purchase Entries
        </p>
        {purchases.length === 0 ? (
          <div
            className="py-8 text-center rounded-xl text-sm"
            style={{
              background: "#1e1e1e",
              border: "1px solid #242424",
              color: "#555",
            }}
          >
            No purchase entries yet.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {purchases.map((p) => (
              <div
                key={p.id}
                className="rounded-xl p-4"
                style={{ background: "#1e1e1e", border: "1px solid #242424" }}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-base font-bold text-white">
                    ₹{p.amount.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs" style={{ color: "#555" }}>
                    {new Date(p.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "2-digit",
                    })}
                  </p>
                </div>
                <p className="text-xs" style={{ color: "#777" }}>
                  {p.note || "No note"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default VendorsPage;
