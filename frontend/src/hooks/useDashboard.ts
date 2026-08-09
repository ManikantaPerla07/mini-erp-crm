import { useQuery } from "@tanstack/react-query";
import {
  getDashboardStats,
} from "../services/dashboard.service";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardStats,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}