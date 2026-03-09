import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/prisma/client";

const signAccess  = (payload: object) =>
  jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!,  { expiresIn: process.env.ACCESS_TOKEN_EXPIRY  as any });

const signRefresh = (payload: object) =>
  jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY as any });

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Invalid credentials");

  const payload = { id: user.id, email: user.email, role: user.role };

  const accessToken  = signAccess(payload);
  const refreshToken = signRefresh(payload);

  // persist refresh token hash in DB
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return {
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
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });
};
