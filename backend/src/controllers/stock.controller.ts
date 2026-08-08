import { Request, Response } from "express";

import {
  createStockMovement,
  getStockMovements,
  getStockMovementById,
} from "../services/stock.service";

import { createStockMovementSchema } from "../validations/stock.validation";

export async function create(req: Request, res: Response) {
  try {
    const data = createStockMovementSchema.parse(req.body);

    const stockMovement = await createStockMovement({
      ...data,
      createdById: req.user.id,
    });

    return res.status(201).json({
      success: true,
      data: stockMovement,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create stock movement",
    });
  }
}

export async function getAll(req: Request, res: Response) {
  try {
    const stock = await getStockMovements();

    return res.json({
      success: true,
      data: stock,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch stock movements",
    });
  }
}

export async function getOne(req: Request, res: Response) {
  try {
    const stock = await getStockMovementById(req.params.id);

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: "Stock movement not found",
      });
    }

    return res.json({
      success: true,
      data: stock,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch stock movement",
    });
  }
}