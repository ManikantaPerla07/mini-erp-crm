import { Request, Response } from "express";

import {
  createCustomerSchema,
  updateCustomerSchema,
} from "../validations/customer.validation";

import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from "../services/customer.service";

export async function create(req: Request, res: Response) {
  try {
    const data = createCustomerSchema.parse(req.body);

    const customer = await createCustomer(data);

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
  try {
    const customers = await getCustomers();

    return res.status(200).json({
      success: true,
      data: customers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch customers",
    });
  }
}

export async function getOne(req: Request, res: Response) {
  try {
    const customer = await getCustomerById(req.params.id as string as string);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch customer",
    });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const data = updateCustomerSchema.parse(req.body);

    const customer = await updateCustomer(req.params.id as string as string, data);

    return res.status(200).json({
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
  try {
    await deleteCustomer(req.params.id as string as string);

    return res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete customer",
    });
  }
}