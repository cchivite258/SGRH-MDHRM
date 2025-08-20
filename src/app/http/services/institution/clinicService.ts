// services/departmentService.ts
import HttpService from "@/app/http/httpService";
import type { ClinicListingType, ClinicInsertType } from "@/components/institution/types";
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

export default class ClinicService extends HttpService { 
    async getClinicByInstitution(
        id: string | null,
        page: number = 0,
        size: number = 10000000,
        sortColumn: string = 'createdAt',
        direction: string = 'asc',
        query_value?: string,
        query_props?: string
    ): Promise<{ content: ClinicListingType[], meta: any }> {
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

             const includesToUse = 'clinic';
                queryParams.push(`includes=${includesToUse}`);

                const queryString = queryParams.join('&');

            const url = `/administration/company/contracted-clinics/in-company?${queryString}`;

            console.log('URL da requisição:', url);
            const response = await this.get<ApiResponse<ClinicListingType[]>>(url);

            return {
                content: response.data || [],
                meta: response.meta || []
            };

        } catch (error) {
            console.error("❌ Erro ao buscar clinicas:", error);
            throw error;
        }
    }

    async getClinicByInstitutionForDropdown(
        id: string | null,
        page: number = 0,
        size: number = 10000000,
        sortColumn: string = 'createdAt',
        direction: string = 'asc',
        query_value?: string,
        query_props?: string
    ): Promise<{ content: ClinicListingType[], meta: any }> {
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

             const includesToUse = 'clinic';
                queryParams.push(`includes=${includesToUse}`);

                const queryString = queryParams.join('&');

            const url = `/administration/company/contracted-clinics/in-company?${queryString}`;

            console.log('URL da requisição:', url);
            const response = await this.get<ApiResponse<ClinicListingType[]>>(url);

            return {
                content: response.data || [],
                meta: response.meta || []
            };

        } catch (error) {
            console.error("❌ Erro ao buscar clinicas:", error);
            throw error;
        }
    }

    async createClinic(clinicData: ClinicInsertType): Promise<ServiceResponse<ClinicListingType>> {
        try {
            const response = await this.post<ApiResponse<ClinicListingType>>('/administration/company/contracted-clinics', clinicData);
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

    async getClinicById(id: string): Promise<{ data: ClinicListingType }> {
        try {
            const response = await this.get<{ data: ClinicListingType; meta: any }>(
                `/administration/company/contracted-clinics/${id}?includes=company`
            );
            console.log('Resposta da requisição getClinicById:------------------------', response);

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

    async deleteClinic(id: string): Promise<void> {
        try {
            await this.delete(`/administration/company/contracted-clinics/${id}`);
        } catch (error) {
            console.error("❌ Erro ao deletar clínica:", error);
            throw error;
        }
    }


    async updateClinic(id: string, clinicData: ClinicInsertType): Promise<ServiceResponse<ClinicListingType>> {
        try {

            // Corpo da requisição conforme especificado
            const payload = {
                clinic: clinicData.clinic,
                company: clinicData.company,
                enabled: clinicData.enabled
            };

            const response = await this.put<ServiceResponse<ClinicListingType>>(`/administration/company/contracted-clinics/${id}`, payload);
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


