import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, BoxIcon } from "lucide-react";
import Sidebar from "./Sidebar";
import useClickEffect from "@/hooks/useClickEffect";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { clickClass, handleClick } = useClickEffect("click-press");

  const openSidebar = () => {
    handleClick();
    setSidebarOpen(true);
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#191818" }}
    >
      {/* Desktop sidebar — always visible ≥768px */}
      <div className="hidden md:flex md:shrink-0">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(2px)",
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile drawer — slides in from left */}
      <div
        className={`fixed inset-y-0 left-0 z-50 md:hidden transition-transform duration-200 ease-in-out`}
        style={{
          width: "70%",
          maxWidth: "280px",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} isMobile />
      </div>

      {/* Content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header
          className="flex md:hidden items-center gap-3 px-4 py-3 shrink-0"
          style={{ borderBottom: "1px solid #222", background: "#141414" }}
        >
          <button
            onClick={openSidebar}
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${clickClass}`}
            style={{ background: "#242424", color: "#aaa" }}
          >
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "#e24815" }}
            >
              <BoxIcon size={15} color="white" />
            </div>
            <span className="text-sm font-bold text-white">IMS Pro</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
