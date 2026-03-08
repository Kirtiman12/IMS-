import { NavLink, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { logout } from "@/features/auth/authSlice";
import useClickEffect from "@/hooks/useClickEffect";
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  Truck,
  Settings,
  LogOut,
  BoxIcon,
  X,
} from "lucide-react";

const NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/products", icon: Package, label: "Products" },
  { to: "/stock", icon: ArrowLeftRight, label: "Stock" },
  { to: "/vendors", icon: Truck, label: "Vendors" },
];

const ROLE_COLOR: Record<string, string> = {
  ADMIN: "#e24815",
  MANAGER: "#3b82f6",
  VIEWER: "#6b7280",
};

type SidebarProps = {
  isMobile?: boolean;
  onClose?: () => void;
};

const Sidebar = ({ isMobile = false, onClose }: SidebarProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const { clickClass, handleClick } = useClickEffect("click-press");

  const handleLogout = () => {
    handleClick();
    dispatch(logout());
    navigate("/login");
    onClose?.();
  };

  const activeLinkStyle = (isActive: boolean) => ({
    background: isActive ? "#242424" : "transparent",
    borderLeft: `3px solid ${isActive ? "#e24815" : "transparent"}`,
    color: isActive ? "white" : "#666",
  });

  return (
    <aside
      className="flex flex-col h-full"
      style={{
        width: isMobile ? "100%" : "240px",
        background: "#141414",
        borderRight: isMobile ? "none" : "1px solid #222",
      }}
    >
      {/* Brand row */}
      <div
        className="flex items-center justify-between px-5 py-5"
        style={{ borderBottom: "1px solid #222" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "#e24815" }}
          >
            <BoxIcon size={16} color="white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">IMS Pro</p>
            <p className="text-xs mt-0.5" style={{ color: "#444" }}>
              Inventory System
            </p>
          </div>
        </div>
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "#242424", color: "#666" }}
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={({ isActive }) => activeLinkStyle(isActive)}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}

        {user?.role === "ADMIN" && (
          <NavLink
            to="/settings"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={({ isActive }) => activeLinkStyle(isActive)}
          >
            <Settings size={17} />
            Settings
          </NavLink>
        )}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4" style={{ borderTop: "1px solid #222" }}>
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ background: "#2a2a2a" }}
          >
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate leading-none">
              {user?.name}
            </p>
            <span
              className="text-xs font-medium mt-1 inline-block px-1.5 py-0.5 rounded"
              style={{
                background: `${ROLE_COLOR[user?.role ?? ""]}22`,
                color: ROLE_COLOR[user?.role ?? ""],
              }}
            >
              {user?.role}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${clickClass}`}
          style={{ color: "#666", background: "#1a1a1a" }}
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
