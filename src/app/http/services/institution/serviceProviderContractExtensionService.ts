import HttpService from "@/app/http/httpService";
import type {
    ServiceProviderContractExtensionPayloadType,
    ServiceProviderContractExtensionType
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

const SERVICE_PROVIDER_CONTRACT_EXTENSIONS_ENDPOINT = "/administration/service-provider-contract-extensions";

const getContent = <T>(response: ApiResponse<T[]>): T[] => response.content ?? response.data ?? [];
const getMeta = (response: ApiResponse<any>): any => response.metadata ?? response.meta ?? {};

const formatDateForApi = (value: Date | string | null): string | null => {
    if (!value) return null;
    if (value instanceof Date) {
        return value.toISOString().split("T")[0];
    }
    return String(value).split("T")[0];
};

const toPayload = (data: ServiceProviderContractExtensionPayloadType) => ({
    serviceProviderId: data.serviceProviderId,
    contractEndDate: formatDateForApi(data.contractEndDate)
});

export default class ServiceProviderContractExtensionService extends HttpService {
    async getByServiceProvider(
        serviceProviderId: string | number,
        page: number = 0,
        size: number = 10,
        sortColumn: string = "contractStartDate",
        direction: string = "desc"
    ): Promise<{ content: ServiceProviderContractExtensionType[]; meta: any }> {
        try {
            const queryParams = [
                `page=${page}`,
                `size=${size}`,
                `sortColumn=${sortColumn}`,
                `direction=${direction}`
            ];

            const url = `${SERVICE_PROVIDER_CONTRACT_EXTENSIONS_ENDPOINT}/by-service-provider/${serviceProviderId}?${queryParams.join("&")}`;
            const response = await this.get<ApiResponse<ServiceProviderContractExtensionType[]>>(url);

            return {
                content: getContent(response),
                meta: getMeta(response)
            };
        } catch (error) {
            throw error;
        }
    }

    async create(
        data: ServiceProviderContractExtensionPayloadType
    ): Promise<ServiceResponse<ServiceProviderContractExtensionType>> {
        try {
            const response = await this.post<ApiResponse<ServiceProviderContractExtensionType>>(
                SERVICE_PROVIDER_CONTRACT_EXTENSIONS_ENDPOINT,
                toPayload(data)
            );

            return {
                status: "success",
                data: (response.data ?? response.content ?? response) as ServiceProviderContractExtensionType
            };
        } catch (error: any) {
            return this.handleServiceError(error);
        }
    }

    async getById(id: string | number): Promise<{ data: ServiceProviderContractExtensionType }> {
        try {
            const response = await this.get<ApiResponse<ServiceProviderContractExtensionType>>(
                `${SERVICE_PROVIDER_CONTRACT_EXTENSIONS_ENDPOINT}/${id}`
            );

            return {
                data: (response.data ?? response.content ?? response) as ServiceProviderContractExtensionType
            };
        } catch (error) {
            throw error;
        }
    }

    async update(
        id: string | number,
        data: ServiceProviderContractExtensionPayloadType
    ): Promise<ServiceResponse<ServiceProviderContractExtensionType>> {
        try {
            const response = await this.put<ApiResponse<ServiceProviderContractExtensionType>>(
                `${SERVICE_PROVIDER_CONTRACT_EXTENSIONS_ENDPOINT}/${id}`,
                toPayload(data)
            );

            return {
                status: "success",
                data: (response.data ?? response.content ?? response) as ServiceProviderContractExtensionType
            };
        } catch (error: any) {
            return this.handleServiceError(error);
        }
    }

    private handleServiceError(error: any): ServiceResponse<ServiceProviderContractExtensionType> {
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
                    instance: SERVICE_PROVIDER_CONTRACT_EXTENSIONS_ENDPOINT
                },
                meta: {
                    timestamp: new Date().toISOString()
                }
            }
        };
    }
}
