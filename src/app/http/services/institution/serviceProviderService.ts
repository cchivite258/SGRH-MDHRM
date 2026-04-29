// services/departmentService.ts
import HttpService from "@/app/http/httpService";
import type { ServiceProviderInsertType, ServiceProviderListingType } from "@/components/institution/types";
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

const CONTRACT_SERVICE_PROVIDERS_ENDPOINT = '/administration/contract/service-providers';
const CONTRACT_SERVICE_PROVIDERS_BY_CONTRACT_ENDPOINT = `${CONTRACT_SERVICE_PROVIDERS_ENDPOINT}/in-contract`;

const getContent = <T>(response: ApiResponse<T[]>): T[] => response.content ?? response.data ?? [];
const getMeta = (response: ApiResponse<any>): any => response.metadata ?? response.meta ?? [];

const toContractServiceProviderPayload = (serviceProviderData: ServiceProviderInsertType) => ({
    serviceProvider: serviceProviderData.serviceProvider,
    contract: serviceProviderData.company
});

const normalizeContractServiceProvider = <T extends Record<string, any>>(item: T): T => ({
    ...item,
    company: item.company ?? item.contract
});

export default class ServiceProviderService extends HttpService { 
    async getServiceProviderByInstitution(
        id: string | null,
        page: number = 0,
        size: number = 10000000,
        sortColumn: string = 'createdAt',
        direction: string = 'asc',
        query_value?: string,
        query_props?: string
    ): Promise<{ content: ServiceProviderListingType[], meta: any }> {
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

             const includesToUse = 'serviceProvider';
                queryParams.push(`includes=${includesToUse}`);

                const queryString = queryParams.join('&');

            const url = `${CONTRACT_SERVICE_PROVIDERS_BY_CONTRACT_ENDPOINT}?${queryString}`;

            console.log('URL da requisição:', url);
            const response = await this.get<ApiResponse<ServiceProviderListingType[]>>(url);

            return {
                content: getContent(response).map((item: any) => normalizeContractServiceProvider(item)) as ServiceProviderListingType[],
                meta: getMeta(response)
            };

        } catch (error) {
            console.error("❌ Erro ao buscar prestadores de serviço:", error);
            throw error;
        }
    }

    async getServiceProviderByInstitutionForDropdown(
        id: string | null,
        page: number = 0,
        size: number = 10000000,
        sortColumn: string = 'createdAt',
        direction: string = 'asc',
        query_value?: string,
        query_props?: string
    ): Promise<{ content: ServiceProviderListingType[], meta: any }> {
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

             const includesToUse = 'serviceProvider';
                queryParams.push(`includes=${includesToUse}`);

                const queryString = queryParams.join('&');

            const url = `${CONTRACT_SERVICE_PROVIDERS_BY_CONTRACT_ENDPOINT}?${queryString}`;

            console.log('URL da requisição:', url);
            const response = await this.get<ApiResponse<ServiceProviderListingType[]>>(url);

            return {
                content: getContent(response).map((item: any) => normalizeContractServiceProvider(item)) as ServiceProviderListingType[],
                meta: getMeta(response)
            };

        } catch (error) {
            console.error("❌ Erro ao buscar prestadores de serviço:", error);
            throw error;
        }
    }

    async createServiceProvider(serviceProviderData: ServiceProviderInsertType): Promise<ServiceResponse<ServiceProviderListingType>> {
        try {
            const response = await this.post<ApiResponse<ServiceProviderListingType>>(CONTRACT_SERVICE_PROVIDERS_ENDPOINT, toContractServiceProviderPayload(serviceProviderData));
            return {
                status: 'success',
                data: normalizeContractServiceProvider((response.data ?? response.content ?? response) as any) as ServiceProviderListingType
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
                instance: CONTRACT_SERVICE_PROVIDERS_ENDPOINT
            },
            meta: {
                timestamp: new Date().toISOString()
            }
        };
    }

    async getServiceProviderById(id: string): Promise<{ data: ServiceProviderListingType }> {
        try {
            const response = await this.get<{ data: ServiceProviderListingType; meta: any }>(
                `${CONTRACT_SERVICE_PROVIDERS_ENDPOINT}/${id}?includes=contract`
            );
            console.log('Resposta da requisição getServiceProviderById:------------------------', response);

            return {
                data: normalizeContractServiceProvider(((response as any).data ?? response) as any) as ServiceProviderListingType
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

    async deleteServiceProvider(id: string): Promise<void> {
        try {
            await this.delete(`${CONTRACT_SERVICE_PROVIDERS_ENDPOINT}/${id}`);
        } catch (error) {
            console.error("❌ Erro ao deletar prestador de serviço:", error);
            throw error;
        }
    }


    async updateServiceProvider(id: string, serviceProviderData: ServiceProviderInsertType): Promise<ServiceResponse<ServiceProviderListingType>> {
        try {

            // Corpo da requisição conforme especificado
            const payload = toContractServiceProviderPayload(serviceProviderData);

            const response = await this.put<ServiceResponse<ServiceProviderListingType>>(`${CONTRACT_SERVICE_PROVIDERS_ENDPOINT}/${id}`, payload);
             return {
                status: 'success',
                data: normalizeContractServiceProvider(((response as any).data ?? response) as any) as ServiceProviderListingType
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
