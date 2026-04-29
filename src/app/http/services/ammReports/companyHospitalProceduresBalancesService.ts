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

const CONTRACT_HOSPITAL_PROCEDURES_BALANCES_REPORT_ENDPOINT = '/reports/contract-hospital-procedures-balances';

export default class CompanyHospitalProceduresBalancesService extends HttpService {

    async createReport(reportData: CompanyHospitalProceduresBalanceType): Promise<ServiceResponse<CompanyHospitalProceduresBalanceType>> {
        try {
            const response = await this.post<ApiResponse<CompanyHospitalProceduresBalanceType>>(CONTRACT_HOSPITAL_PROCEDURES_BALANCES_REPORT_ENDPOINT, reportData);
            //console.log("100001 report:",response)
            return {
                status: 'success',
                data: response.data ?? (response as unknown as CompanyHospitalProceduresBalanceType)
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
                instance: CONTRACT_HOSPITAL_PROCEDURES_BALANCES_REPORT_ENDPOINT,
            },
            meta: {
                timestamp: new Date().toISOString()
            }
        };
    }


 
}
