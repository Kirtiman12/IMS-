import type { Request, Response } from "express";
import * as VendorService from "@/services/vendor.service";

export const getAll = async (_req: Request, res: Response) => {
  const vendors = await VendorService.getAllVendors();
  res.json({
    message: `${vendors.length} vendor(s) found`,
    data: vendors,
  });
};

export const create = async (req: Request, res: Response) => {
   console.log("BODY:", req.body);           
  console.log("HEADERS:", req.headers);     
  const { name, email, phone, address } = req.body;
  if (!name) {
    res.status(400).json({ message: "Vendor name is required" });
    return;
  }
  const vendor = await VendorService.createVendor({ name, email, phone, address });
  res.status(201).json({
    message: `Vendor "${vendor.name}" created successfully`,
    data: vendor,
  });
};

// export const getPurchases = async (req: Request, res: Response) => {
//   const purchases = await VendorService.getVendorPurchases(req.params.id as string);
//   res.json({
//     message: `${purchases.length} purchase(s) found`,
//     data: purchases,
//   });
// };

export const createPurchase = async (req: Request, res: Response) => {
  const entry = await VendorService.createPurchaseEntry({
    ...req.body,
    vendorId: req.params.id as string,
  });
  res.status(201).json({
    message: "Purchase entry created successfully",
    data: entry,
  });
};
