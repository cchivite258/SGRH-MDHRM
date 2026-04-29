// services/departmentService.ts
import HttpService from "@/app/http/httpService";
import type { BudgetInsertType, BudgetListingType } from "@/components/institution/types";
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

const BUDGETS_ENDPOINT = '/administration/contract/coverage-period-budgets';

const getContent = <T>(response: ApiResponse<T[]>): T[] => response.content ?? response.data ?? [];
const getMeta = (response: ApiResponse<any>): any => response.metadata ?? response.meta ?? [];

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
            const url = `${BUDGETS_ENDPOINT}/by-coverage-period-id/${id}?${queryString}&includes=coveragePeriod,coveragePeriodBudgetTransaction,invoice`;

            console.log('URL da requisição:', url);
            const response = await this.get<ApiResponse<BudgetListingType[]>>(url);

            return {
                content: getContent(response),
                meta: getMeta(response)
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
            const url = `${BUDGETS_ENDPOINT}/by-coverage-period-id/${id}?${queryString}&includes=coveragePeriod,coveragePeriodBudgetTransaction,invoice`;

            console.log('URL da requisição:', url);
            const response = await this.get<ApiResponse<BudgetListingType[]>>(url);

            return {
                content: getContent(response),
                meta: getMeta(response)
            };

        } catch (error) {
            console.error("❌ Erro ao buscar orcamentos:", error);
            throw error;
        }
    }

    async createBudget(budgetData: BudgetInsertType): Promise<ServiceResponse<BudgetListingType>> {
        try {
            const response = await this.post<ApiResponse<BudgetListingType>>(BUDGETS_ENDPOINT, budgetData);
            return {
                status: 'success',
                data: response.data ?? response.content ?? (response as BudgetListingType)
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
                instance: BUDGETS_ENDPOINT,
            },
            meta: {
                timestamp: new Date().toISOString()
            }
        };
    }

    async getBudgetById(id: string): Promise<{ data: BudgetListingType }> {
        try {
            const response = await this.get<{ data: BudgetListingType; meta: any }>(
                `${BUDGETS_ENDPOINT}/${id}?includes=coveragePeriod,coveragePeriodBudgetTransaction,invoice`
            );
            console.log('Resposta da requisição getBudgetById:------------------------', response);

            return {
                data: ((response as any).data ?? response) as BudgetListingType
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
            await this.delete(`${BUDGETS_ENDPOINT}/${id}`);
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
                budgetAmount: budgetData.budgetAmount
            };

            const response = await this.put<ServiceResponse<BudgetListingType>>(`${BUDGETS_ENDPOINT}/${id}`, payload);
            return {
                status: 'success',
                data: ((response as any).data ?? response) as BudgetListingType
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


