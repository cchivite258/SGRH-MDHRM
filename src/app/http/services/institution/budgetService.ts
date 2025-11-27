// services/departmentService.ts
import HttpService from "@/app/http/httpService";
import type { BudgetInsertType, BudgetListingType } from "@/components/institution/types";
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

export default class BudgetService extends HttpService {
    async getBudgetByCoveragePeriod(
        id: string | null,
        page: number = 0,
        size: number = 5,
        sortColumn: string = 'createdAt',
        direction: string = 'asc',
        query_value?: string,
        query_props?: string
    ): Promise<{ content: BudgetListingType[], meta: any }> {
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
            const url = `/administration/company/coverage-period-budgets/by-coverage-period-id/${id}/${queryString}`;

            console.log('URL da requisição:', url);
            const response = await this.get<ApiResponse<BudgetListingType[]>>(url);

            return {
                content: response.data || [],
                meta: response.meta || []
            };

        } catch (error) {
            console.error("❌ Erro ao buscar orcamentos:", error);
            throw error;
        }
    }

    async getBudgetByCoveragePeriodForDropdown(
        id: string | undefined,
        page: number = 0,
        size: number = 10000000,
        sortColumn: string = 'createdAt',
        direction: string = 'asc',
        query_value?: string,
        query_props?: string
    ): Promise<{ content: BudgetListingType[], meta: any }> {
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
            const url = `/administration/company/coverage-period-budgets/by-coverage-period-id/${id}?includes=coveragePeriod`;

            console.log('URL da requisição:', url);
            const response = await this.get<ApiResponse<BudgetListingType[]>>(url);

            return {
                content: response.data || [],
                meta: response.meta || []
            };

        } catch (error) {
            console.error("❌ Erro ao buscar orcamentos:", error);
            throw error;
        }
    }

    async createBudget(budgetData: BudgetInsertType): Promise<ServiceResponse<BudgetListingType>> {
        try {
            const response = await this.post<ApiResponse<BudgetListingType>>('/administration/company/coverage-period-budgets', budgetData);
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
                instance: '/administration/company/coverage-period-budgets',
            },
            meta: {
                timestamp: new Date().toISOString()
            }
        };
    }

    async getBudgetById(id: string): Promise<{ data: BudgetListingType }> {
        try {
            const response = await this.get<{ data: BudgetListingType; meta: any }>(
                `/administration/company/coverage-period-budgets/${id}?includes=coveragePeriod`
            );
            console.log('Resposta da requisição getBudgetById:------------------------', response);

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

    async deleteBudget(id: string): Promise<void> {
        try {
            await this.delete(`/administration/company/coverage-period-budgets/${id}`);
        } catch (error) {
            console.error("❌ Erro ao deletar orcamento:", error);
            throw error;
        }
    }


    async updateBudget(id: string, budgetData: BudgetInsertType): Promise<ServiceResponse<BudgetListingType>> {
        try {

            // Corpo da requisição conforme especificado
            const payload = {
                name: budgetData.name,
                coveragePeriod: budgetData.coveragePeriod,
                budgetAmount: budgetData.budgetAmount,
                enabled: budgetData.enabled
            };

            const response = await this.put<ServiceResponse<BudgetListingType>>(`/administration/company/coverage-period-budgets/${id}`, payload);
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


