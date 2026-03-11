import type { Request, Response } from "express";
import {
  loginUser,
  registerUser,
  refreshAccessToken,
  logoutUser,
} from "@/services/auth.service";

const COOKIE_OPTS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge:   7 * 24 * 60 * 60 * 1000,
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: "Email and password required" });
    return;
  }
  const data = await loginUser(email, password);
  res.cookie("refreshToken", data.refreshToken, COOKIE_OPTS);
  res.json({ accessToken: data.accessToken, user: data.user });
};

// ← NEW
export const register = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ message: "Name, email and password required" });
    return;
  }
  const data = await registerUser({ name, email, password, role });
  res.cookie("refreshToken", data.refreshToken, COOKIE_OPTS);
  res.status(201).json({ accessToken: data.accessToken, user: data.user });
};

export const refresh = async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) { res.status(401).json({ message: "No refresh token" }); return; }
  const data = await refreshAccessToken(token);
  res.json(data);
};

export const logout = async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    try {
      const jwt     = require("jsonwebtoken");
      const decoded: any = jwt.decode(token);
      if (decoded?.id) await logoutUser(decoded.id);
    } catch {}
  }
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out" });
};

export const getMe = async (req: Request, res: Response) => {
  res.json({ user: req?.user });
};
