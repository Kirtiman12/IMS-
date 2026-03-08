import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/app/hooks";
import { loginSuccess } from "../features/auth/authSlice";
import { HARDCODED_USERS, type Role } from "@/mock/mockData";
import useClickEffect from "@/hooks/useClickEffect";
import { BoxIcon, Eye, EyeOff } from "lucide-react";

const ROLE_MAP: Record<Role, (typeof HARDCODED_USERS)[0]> = {
  ADMIN: HARDCODED_USERS[0],
  MANAGER: HARDCODED_USERS[1],
  VIEWER: HARDCODED_USERS[2],
};

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("ADMIN");
  const [email, setEmail] = useState(HARDCODED_USERS[0].email);
  const [password, setPassword] = useState(HARDCODED_USERS[0].password);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const { clickClass, handleClick } = useClickEffect("click-press");

  const onRoleChange = (r: Role) => {
    setRole(r);
    setEmail(ROLE_MAP[r].email);
    setPassword(ROLE_MAP[r].password);
    setError("");
  };

  const handleLogin = () => {
    handleClick();
    const user = HARDCODED_USERS.find(
      (u) => u.email === email && u.password === password,
    );
    if (!user) {
      setError("Invalid credentials.");
      return;
    }
    dispatch(
      loginSuccess({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }),
    );
    navigate("/dashboard");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
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
          Select role to auto-fill demo credentials
        </p>

        {/* Role Tabs */}
        <div className="mb-5">
          <label
            className="text-xs font-medium uppercase tracking-wider mb-2 block"
            style={{ color: "#888" }}
          >
            Login As
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["ADMIN", "MANAGER", "VIEWER"] as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => onRoleChange(r)}
                className="py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: role === r ? "#e24815" : "#2a2a2a",
                  color: role === r ? "white" : "#888",
                  border: `1px solid ${role === r ? "#e24815" : "#333"}`,
                }}
              >
                {r.charAt(0) + r.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
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
          className={`w-full py-3 rounded-lg font-semibold text-white text-sm ${clickClass}`}
          style={{ background: "#e24815" }}
        >
          Sign In
        </button>

        {/* Demo hint */}
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
      </div>
    </div>
  );
};

export default LoginPage;
