import type { Request, Response } from "express";
import * as StockService from "@/services/stock.service";

export const getHistory = async (req: Request, res: Response) => {
  const { productId } = req.query;
  const entries = await StockService.getStockHistory(productId as string);
  res.json(entries);
};

export const create = async (req: Request, res: Response) => {
  // Extract userId from JWT via authenticate middleware
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthenticated" });
    return;
  }
  const entry = await StockService.createStockEntry({ ...req.body, userId });
  res.status(201).json(entry);
};
