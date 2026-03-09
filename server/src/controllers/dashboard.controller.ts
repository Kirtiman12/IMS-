import type { Request, Response } from "express";
import { getDashboardStats, getLowStock } from "@/services/dashboard.service";

export const getStats = async (_req: Request, res: Response) => {
  const stats = await getDashboardStats();
  res.json(stats);
};

export const getLowStockItems = async (_req: Request, res: Response) => {
  const items = await getLowStock();
  res.json(items);
};
