import type { Request, Response } from "express";
import * as ProductService from "@/services/product.service";

export const getAll = async (req: Request, res: Response) => {
  const categoryId = req.query.categoryId as string | undefined;
  const search     = req.query.search     as string | undefined;
  const sortBy     = req.query.sortBy     as string | undefined;
  const products   = await ProductService.getAllProducts(categoryId, search, sortBy);
  res.json(products);
};

export const getById = async (req: Request, res: Response) => {
  const product = await ProductService.getProductById(req.params.id as string); 
  if (!product) { res.status(404).json({ message: "Product not found" }); return; }
  res.json(product);
};

export const create = async (req: Request, res: Response) => {
  const product = await ProductService.createProduct(req.body);
  res.status(201).json(product);
};

export const update = async (req: Request, res: Response) => {
  const product = await ProductService.updateProduct(req.params.id as string, req.body); 
  res.json(product);
};

export const remove = async (req: Request, res: Response) => {
  await ProductService.deleteProduct(req.params.id as string); 
  res.status(204).send();
};
