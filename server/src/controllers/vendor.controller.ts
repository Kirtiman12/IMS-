import type { Request, Response } from "express";
import * as VendorService from "@/services/vendor.service";

export const getAll = async (_req: Request, res: Response) => {
  res.json(await VendorService.getAllVendors());
};

export const create = async (req: Request, res: Response) => {
  const vendor = await VendorService.createVendor(req.body);
  res.status(201).json(vendor);
};

export const getPurchases = async (req: Request, res: Response) => {
  res.json(await VendorService.getVendorPurchases(req.params.id));
};

export const createPurchase = async (req: Request, res: Response) => {
  const entry = await VendorService.createPurchaseEntry({
    ...req.body,
    vendorId: req.params.id,
  });
  res.status(201).json(entry);
};
