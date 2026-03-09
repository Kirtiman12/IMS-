import type { Request, Response } from "express";
import * as ProductService from "@/services/product.service";

export const getAll = async (req: Request, res: Response) => {
  const { categoryId, search } = req.query;
  const products = await ProductService.getAllProducts(
    categoryId as string,
    search    as string
  );
  res.json(products);
};

export const getOne = async (req: Request, res: Response) => {
  const product = await ProductService.getProductById(req.params.id);
  if (!product) { res.status(404).json({ message: "Product not found" }); return; }
  res.json(product);
};

export const create = async (req: Request, res: Response) => {
  const product = await ProductService.createProduct(req.body);
  res.status(201).json(product);
};

export const update = async (req: Request, res: Response) => {
  const product = await ProductService.updateProduct(req.params.id, req.body);
  res.json(product);
};

export const remove = async (req: Request, res: Response) => {
  await ProductService.deleteProduct(req.params.id);
  res.status(204).send();
};
