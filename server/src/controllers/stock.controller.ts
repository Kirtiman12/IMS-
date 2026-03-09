import type { Request, Response } from "express";
import * as StockService from "@/services/stock.service";

export const getHistory = async (req: Request, res: Response) => {
  const { productId } = req.query;
  const entries = await StockService.getStockHistory(productId as string);
  res.json(entries);
};

export const create = async (req: Request, res: Response) => {
  const entry = await StockService.createStockEntry(req.body);
  res.status(201).json(entry);
};
