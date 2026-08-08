import { Request, Response } from "express";

import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from "../services/customer.service";

export async function create(req: Request, res: Response) {
  try {
    const customer = await createCustomer(req.body);

    return res.status(201).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create customer",
    });
  }
}

export async function getAll(req: Request, res: Response) {
  const customers = await getCustomers();

  return res.json({
    success: true,
    data: customers,
  });
}

export async function getOne(req: Request, res: Response) {
  const customer = await getCustomerById(req.params.id);

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: "Customer not found",
    });
  }

  return res.json({
    success: true,
    data: customer,
  });
}

export async function update(req: Request, res: Response) {
  try {
    const customer = await updateCustomer(req.params.id, req.body);

    return res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update customer",
    });
  }
}

export async function remove(req: Request, res: Response) {
  await deleteCustomer(req.params.id);

  return res.json({
    success: true,
    message: "Customer deleted successfully",
  });
}