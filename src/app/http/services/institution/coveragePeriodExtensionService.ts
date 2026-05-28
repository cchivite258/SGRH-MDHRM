import HttpService from "@/app/http/httpService";
import type {
    CoveragePeriodExtensionPayloadType,
    CoveragePeriodExtensionType
} from "@/components/institution/types";
import type { ApiErrorResponse } from "@/app/common/types/errorType";

interface ApiResponse<T> {
    data?: T;
    content?: T;
    meta?: any;
    metadata?: any;
}

interface ServiceResponse<T> {
    status: "success" | "error";
    data?: T;
    error?: ApiErrorResponse;
}

const COVERAGE_PERIOD_EXTENSIONS_ENDPOINT = "/administration/contract/coverage-period-extensions";

const getContent = <T>(response: ApiResponse<T[]>): T[] => response.content ?? response.data ?? [];
const getMeta = (response: ApiResponse<any>): any => response.metadata ?? response.meta ?? {};

const formatDateForApi = (value: Date | string | null): string | null => {
    if (!value) return null;
    if (value instanceof Date) {
        return value.toISOString().split("T")[0];
    }
    return String(value).split("T")[0];
};

const toPayload = (data: CoveragePeriodExtensionPayloadType) => ({
    coveragePeriodId: data.coveragePeriodId,
    endDate: formatDateForApi(data.endDate)
});

export default class CoveragePeriodExtensionService extends HttpService {
    async getAll(
        page: number = 0,
        size: number = 10,
        sortColumn: string = "startDate",
        direction: string = "desc"
    ): Promise<{ content: CoveragePeriodExtensionType[]; meta: any }> {
        try {
            const queryParams = [
                `page=${page}`,
                `size=${size}`,
                `sortColumn=${sortColumn}`,
                `direction=${direction}`
            ];

            const response = await this.get<ApiResponse<CoveragePeriodExtensionType[]>>(
                `${COVERAGE_PERIOD_EXTENSIONS_ENDPOINT}?${queryParams.join("&")}`
            );

            return {
                content: getContent(response),
                meta: getMeta(response)
            };
        } catch (error) {
            throw error;
        }
    }

    async getByCoveragePeriod(
        coveragePeriodId: string | number,
        page: number = 0,
        size: number = 10,
        sortColumn: string = "startDate",
        direction: string = "desc"
    ): Promise<{ content: CoveragePeriodExtensionType[]; meta: any }> {
        try {
            const queryParams = [
                `page=${page}`,
                `size=${size}`,
                `sortColumn=${sortColumn}`,
                `direction=${direction}`
            ];

            const response = await this.get<ApiResponse<CoveragePeriodExtensionType[]>>(
                `${COVERAGE_PERIOD_EXTENSIONS_ENDPOINT}/by-coverage-period/${coveragePeriodId}?${queryParams.join("&")}`
            );

            return {
                content: getContent(response),
                meta: getMeta(response)
            };
        } catch (error) {
            throw error;
        }
    }

    async create(data: CoveragePeriodExtensionPayloadType): Promise<ServiceResponse<CoveragePeriodExtensionType>> {
        try {
            const response = await this.post<ApiResponse<CoveragePeriodExtensionType>>(
                COVERAGE_PERIOD_EXTENSIONS_ENDPOINT,
                toPayload(data)
            );

            return {
                status: "success",
                data: (response.data ?? response.content ?? response) as CoveragePeriodExtensionType
            };
        } catch (error: any) {
            return this.handleServiceError(error);
        }
    }

    async getById(id: string | number): Promise<{ data: CoveragePeriodExtensionType }> {
        try {
            const response = await this.get<ApiResponse<CoveragePeriodExtensionType>>(
                `${COVERAGE_PERIOD_EXTENSIONS_ENDPOINT}/${id}`
            );

            return {
                data: (response.data ?? response.content ?? response) as CoveragePeriodExtensionType
            };
        } catch (error) {
            throw error;
        }
    }

    async update(
        id: string | number,
        data: CoveragePeriodExtensionPayloadType
    ): Promise<ServiceResponse<CoveragePeriodExtensionType>> {
        try {
            const response = await this.put<ApiResponse<CoveragePeriodExtensionType>>(
                `${COVERAGE_PERIOD_EXTENSIONS_ENDPOINT}/${id}`,
                toPayload(data)
            );

            return {
                status: "success",
                data: (response.data ?? response.content ?? response) as CoveragePeriodExtensionType
            };
        } catch (error: any) {
            return this.handleServiceError(error);
        }
    }

    private handleServiceError(error: any): ServiceResponse<CoveragePeriodExtensionType> {
        if (error.response) {
            return {
                status: "error",
                error: error.response.data as ApiErrorResponse
            };
        }

        return {
            status: "error",
            error: {
                status: "error",
                message: "Network error",
                error: {
                    type: "ConnectionError",
                    title: "Network Error",
                    status: 503,
                    detail: "Could not connect to server",
                    instance: COVERAGE_PERIOD_EXTENSIONS_ENDPOINT
                },
                meta: {
                    timestamp: new Date().toISOString()
                }
            }
        };
    }
}
