import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/app/hooks";
import { loginSuccess } from "@/store/authSlice";
import useClickEffect from "@/hooks/useClickEffect";
import { BoxIcon, Eye, EyeOff } from "lucide-react";
import type { Role } from "@/mock/mockData";
import api from "@/services/axiosInstance";

const RegisterPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState<Role>("VIEWER");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const { clickClass, handleClick } = useClickEffect("click-press");

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Invalid email address";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Minimum 6 characters";
    if (confirm !== password) e.confirm = "Passwords do not match";
    return e;
  };

  const handleRegister = async () => {
    handleClick();
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});
    setApiError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });
      dispatch(
        loginSuccess({
          user: res.data.user,
          token: res.data.accessToken,
        }),
      );
      navigate("/dashboard");
    } catch (err: any) {
      setApiError(
        err.response?.data?.message ?? "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const Field = ({
    label,
    value,
    onChange,
    type = "text",
    error,
    placeholder,
    rightSlot,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    error?: string;
    placeholder?: string;
    rightSlot?: React.ReactNode;
  }) => (
    <div className="mb-4">
      <label
        className="text-xs font-medium uppercase tracking-wider mb-2 block"
        style={{ color: "#888" }}
      >
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 rounded-lg text-white text-sm outline-none"
          style={{
            background: "#2a2a2a",
            border: `1px solid ${error ? "#e24815" : "#333"}`,
            paddingRight: rightSlot ? "2.75rem" : undefined,
          }}
        />
        {rightSlot && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightSlot}
          </div>
        )}
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );

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

        <h2 className="text-2xl font-bold text-white mb-1">Create Account</h2>
        <p className="text-sm mb-6" style={{ color: "#666" }}>
          Fill in your details to get started
        </p>

        {/* Full Name */}
        <Field
          label="Full Name"
          value={name}
          onChange={setName}
          placeholder="John Doe"
          error={errors.name}
        />

        {/* Email */}
        <Field
          label="Email"
          value={email}
          onChange={setEmail}
          type="email"
          placeholder="you@example.com"
          error={errors.email}
        />

        {/* Password */}
        <Field
          label="Password"
          value={password}
          onChange={setPassword}
          type={showPass ? "text" : "password"}
          placeholder="Min. 6 characters"
          error={errors.password}
          rightSlot={
            <button
              onClick={() => setShowPass(!showPass)}
              style={{ color: "#666" }}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />

        {/* Confirm Password */}
        <Field
          label="Confirm Password"
          value={confirm}
          onChange={setConfirm}
          type={showConfirm ? "text" : "password"}
          placeholder="Re-enter password"
          error={errors.confirm}
          rightSlot={
            <button
              onClick={() => setShowConfirm(!showConfirm)}
              style={{ color: "#666" }}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />

        {/* Role */}
        <div className="mb-6">
          <label
            className="text-xs font-medium uppercase tracking-wider mb-2 block"
            style={{ color: "#888" }}
          >
            Role
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["ADMIN", "MANAGER", "VIEWER"] as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
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

        {/* API error */}
        {apiError && <p className="text-red-400 text-sm mb-4">{apiError}</p>}

        <button
          onClick={handleRegister}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold text-white text-sm ${clickClass} disabled:opacity-50 disabled:cursor-not-allowed`}
          style={{ background: "#e24815" }}
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="text-center text-sm mt-5" style={{ color: "#555" }}>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium"
            style={{ color: "#e24815" }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
