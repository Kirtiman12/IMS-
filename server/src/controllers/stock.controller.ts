import type { Request, Response } from "express";
import * as StockService from "@/services/stock.service";

export const getHistory = async (req: Request, res: Response) => {
  try {
    const { productId } = req.query;
    const entries = await StockService.getStockHistory(productId as string);
    res.json(entries);
  } catch (err) {
    console.error("GET /stock error:", err);
    res.status(500).json({ message: "Failed to fetch stock history" });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthenticated" });
      return;
    }
    const entry = await StockService.createStockEntry({ ...req.body, userId });
    res.status(201).json(entry);
  } catch (err) {
    console.error("POST /stock error:", err);
    res.status(500).json({ message: "Failed to create stock entry" });
  }
};
