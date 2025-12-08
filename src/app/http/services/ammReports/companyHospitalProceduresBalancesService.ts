// services/departmentService.ts
import HttpService from "@/app/http/httpService";
import type { CompanyHospitalProceduresBalanceType } from "@/components/ammReports/types";
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

export default class CompanyHospitalProceduresBalancesService extends HttpService {

    async createReport(reportData: CompanyHospitalProceduresBalanceType): Promise<ServiceResponse<CompanyHospitalProceduresBalanceType>> {
        try {
            const response = await this.post<ApiResponse<CompanyHospitalProceduresBalanceType>>('/reports/company-hospital-procedures-balances', reportData);
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
                instance: '/reports/company-hospital-procedures-balances',
            },
            meta: {
                timestamp: new Date().toISOString()
            }
        };
    }


 
}

