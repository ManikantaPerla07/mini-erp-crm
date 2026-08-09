import api from "./api";

export interface DashboardStats {
  totalCustomers: number;
  totalProducts: number;
  totalChallans: number;
  lowStockProducts: number;
  upcomingFollowups: number;
  inventoryValue: number;
}

interface DashboardResponse {
  success: boolean;
  data: DashboardStats;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const response =
    await api.get<DashboardResponse>("/dashboard");

  return response.data.data;
}