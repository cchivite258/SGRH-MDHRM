import HttpService from "@/app/http/httpService";
import type { TopServiceTypesByClinicFilterType, TopServiceTypesByClinicReportType } from "@/components/ammReports/types";
import type { ApiErrorResponse } from "@/app/common/types/errorType";

interface ApiResponse<T> {
  data: T;
  meta?: any;
}

interface ServiceResponse<T> {
  status: "success" | "error";
  data?: T;
  error?: ApiErrorResponse;
}

export default class TopServiceTypesByClinicReportService extends HttpService {
  async createReport(
    payload: TopServiceTypesByClinicFilterType
  ): Promise<ServiceResponse<TopServiceTypesByClinicReportType>> {
    try {
      const response = await this.post<ApiResponse<TopServiceTypesByClinicReportType>>(
        "/reports/service-providers/",
        payload
      );
      console.log("TopServiceTypesByClinicReportType---------------------------------------", response)
      return { status: "success", data: response.data };
    } catch (error: any) {
      if (error.response) {
        return {
          status: "error",
          error: error.response.data as ApiErrorResponse
        };
      }
      return {
        status: "error",
        error: this.networkErrorResponse()
      };
    }
  }

  private networkErrorResponse(): ApiErrorResponse {
    return {
      status: "error",
      message: "Network error",
      error: {
        type: "ConnectionError",
        title: "Network Error",
        status: 503,
        detail: "Could not connect to server",
        instance: "/reports/service-providers/"
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }
}
