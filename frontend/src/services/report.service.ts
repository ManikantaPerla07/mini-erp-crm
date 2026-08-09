import api from "./api";

export interface InventoryReportItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minimumStock: number;
  unitPrice: number | string;
  warehouseLocation: string;
}

export interface CustomerReportItem {
  id: string;
  customerName: string;
  businessName?: string | null;
  phone?: string | null;
  email?: string | null;
  customerType?: string | null;
  status?: string | null;
  challans?: unknown[];
  followUps?: unknown[];
}

export interface ChallanReportItem {
  id: string;
  challanNumber?: string | null;
  status?: string | null;
  totalAmount?: number | string | null;
  createdAt: string;
  customer?: {
    id?: string;
    customerName?: string;
    businessName?: string | null;
  } | null;
  createdBy?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  } | null;
  items?: unknown[];
}

interface ReportResponse<T> {
  success: boolean;
  data: T;
}

export async function getInventoryReport(): Promise<InventoryReportItem[]> {
  const response = await api.get<ReportResponse<InventoryReportItem[]>>(
    "/reports/inventory"
  );

  return response.data.data || [];
}

export async function getCustomerReport(): Promise<CustomerReportItem[]> {
  const response = await api.get<ReportResponse<CustomerReportItem[]>>(
    "/reports/customers"
  );

  return response.data.data || [];
}

export async function getChallanReport(): Promise<ChallanReportItem[]> {
  const response = await api.get<ReportResponse<ChallanReportItem[]>>(
    "/reports/challans"
  );

  return response.data.data || [];
}