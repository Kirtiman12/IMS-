import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch } from "@/app/hooks";
import { loginSuccess } from "../store/authSlice";
import { HARDCODED_USERS, type Role } from "@/mock/mockData";
import useClickEffect from "@/hooks/useClickEffect";
import { BoxIcon, Eye, EyeOff, ChevronDown } from "lucide-react";
import api from "@/services/axiosInstance";

type DemoRole = Role | "CUSTOM";

const ROLE_MAP: Record<Role, (typeof HARDCODED_USERS)[0]> = {
  ADMIN: HARDCODED_USERS[0],
  MANAGER: HARDCODED_USERS[1],
  VIEWER: HARDCODED_USERS[2],
};

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<DemoRole>("ADMIN");
  const [email, setEmail] = useState(HARDCODED_USERS[0].email);
  const [password, setPassword] = useState(HARDCODED_USERS[0].password);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { clickClass, handleClick } = useClickEffect("click-press");

  const onRoleChange = (val: DemoRole) => {
    setSelectedRole(val);
    setError("");
    if (val !== "CUSTOM") {
      setEmail(ROLE_MAP[val].email);
      setPassword(ROLE_MAP[val].password);
    } else {
      setEmail("");
      setPassword("");
    }
  };

  const handleLogin = async () => {
    handleClick();

    setTimeout(async () => {
      setLoading(true);
      setError("");

      // — MOCK path: demo roles
      if (selectedRole !== "CUSTOM") {
        const user = HARDCODED_USERS.find(
          (u) => u.email === email && u.password === password,
        );
        if (!user) {
          setError("Invalid demo credentials.");
          setLoading(false);
          return;
        }
        dispatch(
          loginSuccess({
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            },
            token: null,
          }),
        );
        navigate("/dashboard");
        setLoading(false);
        return;
      }

      // — REAL API path: custom login
      try {
        const res = await api.post("/auth/login", { email, password });
        dispatch(
          loginSuccess({
            user: res.data.user,
            token: res.data.accessToken,
          }),
        );
        navigate("/dashboard");
      } catch (err: any) {
        setError(err.response?.data?.message ?? "Invalid credentials.");
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center scale-[0.85] md:scale-[1]"
      style={{ background: "#191818" }}
    >
      <div
        className="w-full max-w-md p-8 rounded-2xl"
        style={{ background: "#1e1e1e", border: "1px solid #2a2a2a" }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "#e24815" }}
          >
            <BoxIcon size={20} color="white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-none">IMS Pro</p>
            <p className="text-xs mt-0.5" style={{ color: "#666" }}>
              Inventory Management System
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-1">Sign In</h2>
        <p className="text-sm mb-6" style={{ color: "#666" }}>
          Select a role to auto-fill demo credentials, or use a real account
        </p>

        {/* Role Dropdown */}
        <div className="mb-5">
          <label
            className="text-xs font-medium uppercase tracking-wider mb-2 block"
            style={{ color: "#888" }}
          >
            Login As
          </label>
          <div className="relative">
            <select
              value={selectedRole}
              onChange={(e) => onRoleChange(e.target.value as DemoRole)}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none appearance-none cursor-pointer pr-10"
              style={{
                background: "#2a2a2a",
                border: "1px solid #333",
                color: selectedRole === "CUSTOM" ? "#60a5fa" : "#e24815",
              }}
            >
              <option value="ADMIN">Demo — Admin</option>
              <option value="MANAGER">Demo — Manager</option>
              <option value="VIEWER">Demo — Viewer</option>
              <option value="CUSTOM">Custom (Real Account)</option>
            </select>
            {/* Chevron icon */}
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                color: selectedRole === "CUSTOM" ? "#60a5fa" : "#e24815",
              }}
            >
              <ChevronDown size={16} />
            </div>
          </div>
          <p
            className="text-xs mt-1.5"
            style={{ color: selectedRole === "CUSTOM" ? "#60a5fa" : "#555" }}
          >
            {selectedRole === "CUSTOM"
              ? "Enter your registered account credentials"
              : "Demo credentials auto-filled below ↓"}
          </p>
        </div>

        {/* Email */}
        <div className="mb-4">
          <label
            className="text-xs font-medium uppercase tracking-wider mb-2 block"
            style={{ color: "#888" }}
          >
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={selectedRole === "CUSTOM" ? "your@email.com" : ""}
            className="w-full px-4 py-3 rounded-lg text-white text-sm outline-none"
            style={{ background: "#2a2a2a", border: "1px solid #333" }}
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label
            className="text-xs font-medium uppercase tracking-wider mb-2 block"
            style={{ color: "#888" }}
          >
            Password
          </label>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={selectedRole === "CUSTOM" ? "••••••••" : ""}
              className="w-full px-4 py-3 rounded-lg text-white text-sm outline-none pr-11"
              style={{ background: "#2a2a2a", border: "1px solid #333" }}
            />
            <button
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "#666" }}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold text-white text-sm ${clickClass} disabled:opacity-50 disabled:cursor-not-allowed`}
          style={{ background: "#e24815" }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {/* Register link */}
        <p className="text-center text-sm mt-5" style={{ color: "#555" }}>
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium"
            style={{ color: "#e24815" }}
          >
            Create one
          </Link>
        </p>

        {/* Demo hint — only show for demo modes */}
        {selectedRole !== "CUSTOM" && (
          <div
            className="mt-5 p-3 rounded-lg"
            style={{ background: "#242424", border: "1px solid #2a2a2a" }}
          >
            <p
              className="text-xs font-semibold mb-1"
              style={{ color: "#f5c573" }}
            >
              Demo Credentials
            </p>
            {HARDCODED_USERS.map((u) => (
              <p key={u.id} className="text-xs" style={{ color: "#555" }}>
                {u.role}: {u.email} / {u.password}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
