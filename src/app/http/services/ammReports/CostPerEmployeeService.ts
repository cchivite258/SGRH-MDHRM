// services/departmentService.ts
import HttpService from "@/app/http/httpService";
import type { CompanyCostPerEmployeeReportType } from "@/components/ammReports/types";
import type { ApiErrorResponse } from "@/app/common/types/errorType";

interface ApiResponse<T> {
    data: T;
    meta?: any;
}

interface ServiceResponse<T> {
    status: 'success' | 'error';
    data?: T;
    error?: ApiErrorResponse;
}

export default class CostPerEmployeeService extends HttpService {

    async createReport(reportData: CompanyCostPerEmployeeReportType): Promise<ServiceResponse<CompanyCostPerEmployeeReportType>> {
        try {
            const response = await this.post<ApiResponse<CompanyCostPerEmployeeReportType>>('/reports/coost-per-employees', reportData);
            return {
                status: 'success',
                data: response.data
            };
        } catch (error: any) {
            if (error.response) {
                return {
                    status: 'error',
                    error: error.response.data as ApiErrorResponse
                };
            }
            return {
                status: 'error',
                error: this.NetworkErrorResponse()
            };
        }
    }

    private NetworkErrorResponse(): ApiErrorResponse {
        return {
            status: 'error',
            message: 'Network error',
            error: {
                type: 'ConnectionError',
                title: 'Network Error',
                status: 503,
                detail: 'Could not connect to server',
                instance: '/reports/coost-per-employees',
            },
            meta: {
                timestamp: new Date().toISOString()
            }
        };
    }


 
}
