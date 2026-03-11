import bcrypt    from "bcryptjs";
import jwt       from "jsonwebtoken";
import { prisma } from "@/prisma/client";

const signAccess  = (payload: object) =>
  jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!,  { expiresIn: process.env.ACCESS_TOKEN_EXPIRES  as any });

const signRefresh = (payload: object) =>
  jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES as any });

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Invalid credentials");

  const payload      = { id: user.id, email: user.email, role: user.role };
  const accessToken  = signAccess(payload);
  const refreshToken = signRefresh(payload);

  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

  return {
    message:      `Welcome back, ${user.name}!`,  // 👈
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
};

export const registerUser = async (data: {
  name:     string;
  email:    string;
  password: string;
  role?:    "ADMIN" | "MANAGER" | "VIEWER";
}) => {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error("Email already in use");

  const hashed = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      name:     data.name,
      email:    data.email,
      password: hashed,
      role:     data.role ?? "VIEWER",
    },
  });

  const payload      = { id: user.id, email: user.email, role: user.role };
  const accessToken  = signAccess(payload);
  const refreshToken = signRefresh(payload);

  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

  return {
    message:      `Account created successfully. Welcome, ${user.name}!`,  // 👈
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
};

export const refreshAccessToken = async (token: string) => {
  let decoded: any;
  try {
    decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!);
  } catch {
    throw new Error("Invalid refresh token");
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user || user.refreshToken !== token) throw new Error("Refresh token revoked");

  const accessToken = signAccess({ id: user.id, email: user.email, role: user.role });
  return { accessToken };
};

export const logoutUser = async (userId: string) => {
  await prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
};
