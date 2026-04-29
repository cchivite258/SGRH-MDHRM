// services/departmentService.ts
import HttpService from "@/app/http/httpService";
import type { CoveragePeriodListingType, CoveragePeriodInsertType } from "@/components/institution/types";
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

const COVERAGE_PERIODS_ENDPOINT = '/administration/contract/coverage-periods';
const COVERAGE_PERIODS_BY_CONTRACT_ENDPOINT = `${COVERAGE_PERIODS_ENDPOINT}/of-contract`;

const getContent = <T>(response: ApiResponse<T[]>): T[] => response.content ?? response.data ?? [];
const getMeta = (response: ApiResponse<any>): any => response.metadata ?? response.meta ?? [];

const toCoveragePeriodPayload = (coveragePeriodData: CoveragePeriodInsertType) => ({
    name: coveragePeriodData.name,
    startDate: coveragePeriodData.startDate,
    endDate: coveragePeriodData.endDate,
    contract: coveragePeriodData.company,
    enabled: coveragePeriodData.enabled
});

const normalizeCoveragePeriod = <T extends Record<string, any>>(item: T): T => ({
    ...item,
    company: item.company ?? item.contract,
    companyId: item.companyId ?? item.contractId
});

export default class CoveragePeriodService extends HttpService {
    async getCoveragePeriodByInstitution(
        id: string | null,
        page: number = 0,
        size: number = 5,
        sortColumn: string = 'createdAt',
        direction: string = 'asc',
        query_value?: string,
        query_props?: string
    ): Promise<{ content: CoveragePeriodListingType[], meta: any }> {
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

            const queryString = queryParams.join('&');
            const url = `${COVERAGE_PERIODS_BY_CONTRACT_ENDPOINT}?${queryString}`;

            console.log('URL da requisição:', url);
            const response = await this.get<ApiResponse<CoveragePeriodListingType[]>>(url);

            return {
                content: getContent(response).map((item: any) => normalizeCoveragePeriod(item)) as CoveragePeriodListingType[],
                meta: getMeta(response)
            };

        } catch (error) {
            console.error("❌ Erro ao buscar periodos:", error);
            throw error;
        }
    }

    async getCoveragePeriodByInstitutionForDropdown(
        id: string | undefined,
        page: number = 0,
        size: number = 10000000,
        sortColumn: string = 'createdAt',
        direction: string = 'asc',
        query_value?: string,
        query_props?: string
    ): Promise<{ content: CoveragePeriodListingType[], meta: any }> {
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

            const queryString = queryParams.join('&');
            const url = `${COVERAGE_PERIODS_BY_CONTRACT_ENDPOINT}?${queryString}`;

            console.log('URL da requisição:', url);
            const response = await this.get<ApiResponse<CoveragePeriodListingType[]>>(url);

            return {
                content: getContent(response).map((item: any) => normalizeCoveragePeriod(item)) as CoveragePeriodListingType[],
                meta: getMeta(response)
            };

        } catch (error) {
            console.error("❌ Erro ao buscar periodos:", error);
            throw error;
        }
    }

    async createCoveragePeriod(coveragePeriodData: CoveragePeriodInsertType): Promise<ServiceResponse<CoveragePeriodListingType>> {
        try {
            const response = await this.post<ApiResponse<CoveragePeriodListingType>>(COVERAGE_PERIODS_ENDPOINT, toCoveragePeriodPayload(coveragePeriodData));
            return {
                status: 'success',
                data: normalizeCoveragePeriod((response.data ?? response.content ?? response) as any) as CoveragePeriodListingType
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
                instance: COVERAGE_PERIODS_ENDPOINT,
            },
            meta: {
                timestamp: new Date().toISOString()
            }
        };
    }

    async getCoveragePeriodById(id: string): Promise<{ data: CoveragePeriodListingType }> {
        try {
            const response = await this.get<{ data: CoveragePeriodListingType; meta: any }>(
                `${COVERAGE_PERIODS_ENDPOINT}/${id}?includes=contract`
            );
            console.log('Resposta da requisição getCoveragePeriodById:------------------------', response);

            return {
                data: normalizeCoveragePeriod(((response as any).data ?? response) as any) as CoveragePeriodListingType
            };
        } catch (error) {
            throw this.handleError(error);
        }
    }


    handleError(error: any) {
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

    async deleteCoveragePeriod(id: string): Promise<void> {
        try {
            await this.delete(`${COVERAGE_PERIODS_ENDPOINT}/${id}`);
        } catch (error) {
            console.error("❌ Erro ao deletar periodo:", error);
            throw error;
        }
    }


    async updateCoveragePeriod(id: string, coveragePeriodData: CoveragePeriodInsertType): Promise<ServiceResponse<CoveragePeriodListingType>> {
        try {

            console.log('Dados para atualização do periodo:', coveragePeriodData);

            // Corpo da requisição conforme especificado
            const payload = toCoveragePeriodPayload(coveragePeriodData);

            const response = await this.put<ServiceResponse<CoveragePeriodListingType>>(`${COVERAGE_PERIODS_ENDPOINT}/${id}`, payload);
            return {
                status: 'success',
                data: normalizeCoveragePeriod(((response as any).data ?? response) as any) as CoveragePeriodListingType
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

    async startCoveragePeriod(id: string): Promise<{ data: ServiceResponse<CoveragePeriodListingType> }> {
        try {
            const response = await this.put<{ data: ServiceResponse<CoveragePeriodListingType>; meta: any }>(
                `${COVERAGE_PERIODS_ENDPOINT}/${id}/start`
            );
            console.log('Resposta ao start do periodo:------------------------', response);

            return {
                data: response.data
            };
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async closeCoveragePeriod(id: string): Promise<{ data: ServiceResponse<CoveragePeriodListingType> }> {
        try {
            const response = await this.put<{ data: ServiceResponse<CoveragePeriodListingType>; meta: any }>(
                `${COVERAGE_PERIODS_ENDPOINT}/${id}/close`
            );
            console.log('Resposta ao close do periodo:------------------------', response);

            return {
                data: response.data
            };
        } catch (error) {
            throw this.handleError(error);
        }
    }

}
