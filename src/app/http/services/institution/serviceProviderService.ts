// services/departmentService.ts
import HttpService from "@/app/http/httpService";
import type { ServiceProviderInsertType, ServiceProviderListingType } from "@/components/institution/types";
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

            const url = `/administration/company/service-providers/in-company?${queryString}`;

            console.log('URL da requisição:', url);
            const response = await this.get<ApiResponse<ServiceProviderListingType[]>>(url);

            return {
                content: response.data || [],
                meta: response.meta || []
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

            const url = `/administration/company/service-providers/in-company?${queryString}`;

            console.log('URL da requisição:', url);
            const response = await this.get<ApiResponse<ServiceProviderListingType[]>>(url);

            return {
                content: response.data || [],
                meta: response.meta || []
            };

        } catch (error) {
            console.error("❌ Erro ao buscar prestadores de serviço:", error);
            throw error;
        }
    }

    async createServiceProvider(serviceProviderData: ServiceProviderInsertType): Promise<ServiceResponse<ServiceProviderListingType>> {
        try {
            const response = await this.post<ApiResponse<ServiceProviderListingType>>('/administration/company/service-providers', serviceProviderData);
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
                instance: '/administration/company/contracted-clinics'
            },
            meta: {
                timestamp: new Date().toISOString()
            }
        };
    }

    async getServiceProviderById(id: string): Promise<{ data: ServiceProviderListingType }> {
        try {
            const response = await this.get<{ data: ServiceProviderListingType; meta: any }>(
                `/administration/company/service-providers/${id}?includes=company`
            );
            console.log('Resposta da requisição getServiceProviderById:------------------------', response);

            return {
                data: response.data
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
            await this.delete(`/administration/company/service-providers/${id}`);
        } catch (error) {
            console.error("❌ Erro ao deletar prestador de serviço:", error);
            throw error;
        }
    }


    async updateServiceProvider(id: string, serviceProviderData: ServiceProviderInsertType): Promise<ServiceResponse<ServiceProviderListingType>> {
        try {

            // Corpo da requisição conforme especificado
            const payload = {
                serviceProvider: serviceProviderData.serviceProvider,
                company: serviceProviderData.company,
                enabled: serviceProviderData.enabled
            };

            const response = await this.put<ServiceResponse<ServiceProviderListingType>>(`/administration/company/service-providers/${id}`, payload);
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


