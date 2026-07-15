import HttpService from "@/app/http/httpService";

type DashboardMetricPayload = {
  contractId: string | number;
  coveragePeriodId: string | number;
};

type ApiResponse<T> = {
  status?: string;
  data?: T;
  content?: T;
  meta?: Record<string, any>;
};

//-------------------------------
const DASHBOARD_ENDPOINT = "/dashboard";

const getResponseData = <T>(response: ApiResponse<T> | T): T => {
  if (!response || typeof response !== "object") return response as T;
  const record = response as Record<string, any>;
  return (record.data ?? record.content ?? response) as T;
};

export default class DashboardService extends HttpService {
  async getPercentageOfBudgetExecution(payload: DashboardMetricPayload): Promise<Record<string, any>> {
    const response = await this.post<ApiResponse<Record<string, any>>>(
      `${DASHBOARD_ENDPOINT}/percentage-of-budget-execution`,
      payload
    );
    return getResponseData(response);
  }

  async getPercentageOfBudgetExecutionByBeneficiaries(payload: DashboardMetricPayload): Promise<Record<string, any>> {
    const response = await this.post<ApiResponse<Record<string, any>>>(
      `${DASHBOARD_ENDPOINT}/percentage-of-budget-execution-by-beneficiaries`,
      payload
    );
    return getResponseData(response);
  }

  async getNetworkUtilizationFee(payload: DashboardMetricPayload): Promise<Record<string, any>> {
    const response = await this.post<ApiResponse<Record<string, any>>>(
      `${DASHBOARD_ENDPOINT}/network-utilization-fee`,
      payload
    );
    return getResponseData(response);
  }

  async getRevenueTrend(payload: DashboardMetricPayload): Promise<Record<string, any>> {
    const response = await this.post<ApiResponse<Record<string, any>>>(
      `${DASHBOARD_ENDPOINT}/revenue-trend`,
      payload
    );
    return getResponseData(response);
  }

  async getHealthcareServiceUseTrends(payload: DashboardMetricPayload): Promise<Record<string, any>> {
    const response = await this.post<ApiResponse<Record<string, any>>>(
      `${DASHBOARD_ENDPOINT}/healthcare-service-use-trends`,
      payload
    );
    return getResponseData(response);
  }

  async getDistributionOfRevenueByServiceProvider(payload: DashboardMetricPayload): Promise<Record<string, any>> {
    const response = await this.post<ApiResponse<Record<string, any>>>(
      `${DASHBOARD_ENDPOINT}/distribution-of-revenue-by-service-provider`,
      payload
    );
    return getResponseData(response);
  }

  async getDistributionOfRevenueFromServiceProvidersContracts(payload: DashboardMetricPayload): Promise<Record<string, any>> {
    const response = await this.post<ApiResponse<Record<string, any>>>(
      `${DASHBOARD_ENDPOINT}/distribuition-of-revenue-from-service-providers-contracts`,
      payload
    );
    return getResponseData(response);
  }
}
