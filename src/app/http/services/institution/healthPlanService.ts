// services/departmentService.ts
import HttpService from "@/app/http/httpService";
import type { HealthPlanListingType, HealthPlanInsertType } from "@/components/institution/types";
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

export default class HealthPlanService extends HttpService {
    async getHealthPlanByInstitution(
        id: string | null,
        page: number = 0,
        size: number = 10000000,
        sortColumn: string = 'createdAt',
        direction: string = 'asc',
        query_value?: string,
        query_props?: string
    ): Promise<{ content: HealthPlanListingType[], meta: any }> {
        try {
            const queryParams = [
                `id=${id}`,
                `page=${page}`,
                `size=${size}`,
                `sortColumn=${sortColumn}`,
                `direction=${direction}`
            ];

            if (query_value && query_props) {
                queryParams.push(`query_props=${encodeURIComponent(query_props)}`);
                queryParams.push(`query_value=${encodeURIComponent(query_value)}`);
            }

            const includesToUse = 'company,coveragePeriod';
            queryParams.push(`includes=${includesToUse}`);

            const queryString = queryParams.join('&');
            const url = `/administration/company/health-plans/of-company?${queryString}`;

            console.log('URL da requisição:', url);
            const response = await this.get<ApiResponse<HealthPlanListingType[]>>(url);

            return {
                content: response.data || [],
                meta: response.meta || []
            };

        } catch (error) {
            console.error("❌ Erro ao buscar periodos:", error);
            throw error;
        }
    }

    async createHealthPlan(healthPlanData: HealthPlanInsertType): Promise<ServiceResponse<HealthPlanListingType>> {
        try {
            const response = await this.post<ApiResponse<HealthPlanListingType>>('/administration/company/health-plans', healthPlanData);
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
                instance: '/administration/company/health-plans',
            },
            meta: {
                timestamp: new Date().toISOString()
            }
        };
    }

    async getHealthPlanById(id: string): Promise<{ data: HealthPlanListingType }> {
        try {
            const response = await this.get<{ data: HealthPlanListingType; meta: any }>(
                `/administration/company/health-plans/${id}?includes=company,coveragePeriod`
            );
            console.log('Resposta da requisição getHealthPlanById:------------------------', response);

            return {
                data: response.data
            };
        } catch (error) {
            throw this.handleError(error);
        }
    }


    handleError(error: any) {
        console.error("❌ Erro na requisição:--------------------------------------------", error);
        if (error.response) {
            return {
                message: error.response.data?.message || 'Erro na requisição',
                details: error.response.data?.errors || null,
                status: error.response.status
            };
        }
        return {
            message: 'Erro de conexão',
            details: null
        };
    }

    async deleteHealthPlan(id: string): Promise<void> {
        try {
            await this.delete(`/administration/company/health-plans/${id}`);
        } catch (error) {
            console.error("❌ Erro ao deletar plano de saúde:", error);
            throw error;
        }
    }


    async updateHealthPlan(id: string, healthPlanData: HealthPlanInsertType): Promise<ServiceResponse<HealthPlanListingType>> {
        try {

            // Corpo da requisição conforme especificado
            const payload = {
                maxNumberOfDependents: healthPlanData.maxNumberOfDependents,
                childrenMaxAge: healthPlanData.childrenMaxAge,
                childrenInUniversityMaxAge: healthPlanData.childrenInUniversityMaxAge,
                healthPlanLimit: healthPlanData.healthPlanLimit,
                salaryComponent: healthPlanData.salaryComponent,
                companyContributionPercentage: healthPlanData.companyContributionPercentage,
                fixedAmount: healthPlanData.fixedAmount,
                coveragePeriod: healthPlanData.coveragePeriod,
                company: healthPlanData.company,
                enabled: healthPlanData.enabled
            };

            const response = await this.put<ServiceResponse<HealthPlanListingType>>(`/administration/company/health-plans/${id}`, payload);
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

    async cloneHealthPlan(healthPlanData: HealthPlanInsertType): Promise<ServiceResponse<HealthPlanListingType>> {
        try {
            const payload = {
                coveragePeriod: healthPlanData.coveragePeriod,
                company: healthPlanData.company,
                companyHealthPlan: healthPlanData.id,
                enabled: healthPlanData.enabled
            };
            console.log('Payload para clonagem:', payload);

            const response = await this.post<ApiResponse<HealthPlanListingType>>('/administration/company/health-plans/clone', payload);

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


    async getActiveHealthPlanByCompany(companyId: string) : Promise<ServiceResponse<HealthPlanListingType>>  {
        try {
            const response = await this.get<ApiResponse<HealthPlanListingType>>(`/administration/company/health-plans/active-health-plan-by-company/${companyId}`);
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



}


