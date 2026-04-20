// services/departmentService.ts
import HttpService from "@/app/http/httpService";
import type { HealthPlanListingType, HealthPlanInsertType } from "@/components/institution/types";
import type { ApiErrorResponse } from "@/app/common/types/errorType";

interface ApiResponse<T> {
    data?: T;
    content?: T;
    meta?: any;
    metadata?: any;
}

interface ServiceResponse<T> {
    status: 'success' | 'error';
    data?: T;
    error?: ApiErrorResponse;
}

const HEALTH_PLANS_ENDPOINT = '/administration/contract/health-plans';
const HEALTH_PLANS_BY_CONTRACT_ENDPOINT = `${HEALTH_PLANS_ENDPOINT}/of-contract`;

const getContent = <T>(response: ApiResponse<T[]>): T[] => response.content ?? response.data ?? [];
const getMeta = (response: ApiResponse<any>): any => response.metadata ?? response.meta ?? [];

const normalizeHealthPlan = <T extends Record<string, any>>(item: T): T => ({
    ...item,
    companyContributionPercentage: item.companyContributionPercentage ?? item.contractContributionPercentage,
    company: item.company ?? item.contract,
    companyId: item.companyId ?? item.contractId
});

const toHealthPlanPayload = (healthPlanData: HealthPlanInsertType) => ({
    maxNumberOfDependents: healthPlanData.maxNumberOfDependents,
    childrenMaxAge: healthPlanData.childrenMaxAge,
    childrenInUniversityMaxAge: healthPlanData.childrenInUniversityMaxAge,
    healthPlanLimit: healthPlanData.healthPlanLimit,
    salaryComponent: healthPlanData.salaryComponent,
    contractContributionPercentage: healthPlanData.companyContributionPercentage,
    fixedAmount: healthPlanData.fixedAmount,
    coveragePeriod: healthPlanData.coveragePeriod,
    contract: healthPlanData.company,
    enabled: healthPlanData.enabled
});

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

            const includesToUse = 'contract,coveragePeriod';
            queryParams.push(`includes=${includesToUse}`);

            const queryString = queryParams.join('&');
            const url = `${HEALTH_PLANS_BY_CONTRACT_ENDPOINT}?${queryString}`;

            console.log('URL da requisição:', url);
            const response = await this.get<ApiResponse<HealthPlanListingType[]>>(url);

            return {
                content: getContent(response).map((item: any) => normalizeHealthPlan(item)) as HealthPlanListingType[],
                meta: getMeta(response)
            };

        } catch (error) {
            console.error("❌ Erro ao buscar periodos:", error);
            throw error;
        }
    }

    async createHealthPlan(healthPlanData: HealthPlanInsertType): Promise<ServiceResponse<HealthPlanListingType>> {
        try {
            const response = await this.post<ApiResponse<HealthPlanListingType>>(HEALTH_PLANS_ENDPOINT, toHealthPlanPayload(healthPlanData));
            return {
                status: 'success',
                data: normalizeHealthPlan((response.data ?? response.content ?? response) as any) as HealthPlanListingType
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
                instance: HEALTH_PLANS_ENDPOINT,
            },
            meta: {
                timestamp: new Date().toISOString()
            }
        };
    }

    async getHealthPlanById(id: string): Promise<{ data: HealthPlanListingType }> {
        try {
            const response = await this.get<{ data: HealthPlanListingType; meta: any }>(
                `${HEALTH_PLANS_ENDPOINT}/${id}?includes=contract,coveragePeriod`
            );
            console.log('Resposta da requisição getHealthPlanById:------------------------', response);

            return {
                data: normalizeHealthPlan(((response as any).data ?? response) as any) as HealthPlanListingType
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
            await this.delete(`${HEALTH_PLANS_ENDPOINT}/${id}`);
        } catch (error) {
            console.error("❌ Erro ao deletar plano de saúde:", error);
            throw error;
        }
    }


    async updateHealthPlan(id: string, healthPlanData: HealthPlanInsertType): Promise<ServiceResponse<HealthPlanListingType>> {
        try {

            // Corpo da requisição conforme especificado
            const payload = toHealthPlanPayload(healthPlanData);

            const response = await this.put<ServiceResponse<HealthPlanListingType>>(`${HEALTH_PLANS_ENDPOINT}/${id}`, payload);
            return {
                status: 'success',
                data: normalizeHealthPlan(((response as any).data ?? response) as any) as HealthPlanListingType
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
                contract: healthPlanData.company,
                contractHealthPlan: healthPlanData.id
            };
            console.log('Payload para clonagem:', payload);

            const response = await this.post<ApiResponse<HealthPlanListingType>>(`${HEALTH_PLANS_ENDPOINT}/clone`, payload);

            return {
                status: 'success',
                data: normalizeHealthPlan((response.data ?? response.content ?? response) as any) as HealthPlanListingType
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
            const response = await this.get<ApiResponse<HealthPlanListingType>>(`${HEALTH_PLANS_ENDPOINT}/active-health-plan-by-contract/${companyId}`);
         return {
                status: 'success',
                data: normalizeHealthPlan((response.data ?? response.content ?? response) as any) as HealthPlanListingType
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
