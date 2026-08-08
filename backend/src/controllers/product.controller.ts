import { Request, Response } from "express";

import {
  createProductSchema,
  updateProductSchema,
} from "../validations/product.validation";

import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../services/product.service";

import {
  createProductSchema,
  updateProductSchema,
} from "../validators/product.validator";

export async function create(req: Request, res: Response) {
  try {
    const data = createProductSchema.parse(req.body);

    const product = await createProduct(data);

    return res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Validation failed",
    });
  }
}

export async function getAll(req: Request, res: Response) {
  try {
    const products = await getProducts();

    return res.json({
      success: true,
      data: products,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
}

export async function getOne(req: Request, res: Response) {
  try {
    const product = await getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.json({
      success: true,
      data: product,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const data = updateProductSchema.parse(req.body);

    const product = await updateProduct(req.params.id, data);

    return res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Update failed",
    });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    await deleteProduct(req.params.id);

    return res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
}