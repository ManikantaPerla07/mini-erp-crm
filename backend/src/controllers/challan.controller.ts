import { Request, Response } from "express";

import {
  createChallan,
  getAllChallans,
  getChallanById,
  deleteChallan,
} from "../services/challan.service";

import { createChallanSchema } from "../validations/challan.validation";

export async function create(req: Request, res: Response) {
  try {
    const data = createChallanSchema.parse(req.body);

    const challan = await createChallan({
      ...data,
      createdById: req.user!.id,
    });

    return res.status(201).json({
      success: true,
      data: challan,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create challan",
    });
  }
}

export async function getAll(req: Request, res: Response) {
  const challans = await getAllChallans();

  return res.json({
    success: true,
    data: challans,
  });
}

export async function getOne(req: Request, res: Response) {
  const challan = await getChallanById(req.params.id as string as string);

  if (!challan) {
    return res.status(404).json({
      success: false,
      message: "Challan not found",
    });
  }

  return res.json({
    success: true,
    data: challan,
  });
}

export async function remove(req: Request, res: Response) {
  await deleteChallan(req.params.id as string as string);

  return res.json({
    success: true,
    message: "Challan deleted successfully",
  });
}