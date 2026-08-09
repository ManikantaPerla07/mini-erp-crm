import api from "./api";

export interface StockProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minimumStock: number;
  warehouseLocation: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  quantity: number;
  movementType: "IN" | "OUT";
  reason: string;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
  createdBy?: {
    id: string;
    name: string;
    email?: string;
  };
}

interface StockListResponse {
  success: boolean;
  data: StockMovement[];
}

interface StockResponse {
  success: boolean;
  data: StockMovement;
}

export interface CreateStockMovementInput {
  productId: string;
  quantity: number;
  movementType: "IN" | "OUT";
  reason: string;
}

export async function getStockMovements(): Promise<StockMovement[]> {
  const response = await api.get<StockListResponse>("/stock");

  return response.data.data;
}

export async function getStockMovementById(
  id: string
): Promise<StockMovement> {
  const response = await api.get<StockResponse>(`/stock/${id}`);

  return response.data.data;
}

export async function createStockMovement(
  data: CreateStockMovementInput
): Promise<StockMovement> {
  const response = await api.post<StockResponse>("/stock", data);

  return response.data.data;
}