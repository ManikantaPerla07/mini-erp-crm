import { Request, Response } from "express";

import {
  inventoryReport,
  customerReport,
  challanReport,
} from "../services/report.service";

export async function inventory(req: Request, res: Response) {
  try {
    const data = await inventoryReport();

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to generate inventory report",
    });
  }
}

export async function customers(req: Request, res: Response) {
  try {
    const data = await customerReport();

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to generate customer report",
    });
  }
}

export async function challans(req: Request, res: Response) {
  try {
    const data = await challanReport();

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to generate challan report",
    });
  }
}