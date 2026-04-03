import type { ApiResponse } from "@/types";
import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "@/constants";
import type { DashboardData } from "@/dataHelper";

export const dashboardApi = {
    dashboard: (): Promise<ApiResponse<DashboardData>> =>
        axiosClient.get(API_ENDPOINTS.DASHBOARD.GET_DASHBOARD),
}