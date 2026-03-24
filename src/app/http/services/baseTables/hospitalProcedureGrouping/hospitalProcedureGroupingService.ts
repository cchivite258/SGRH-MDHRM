import HttpService from "@/app/http/httpService";
import type {
  HospitalProcedureGroupingInsert,
  HospitalProcedureGroupingListing
} from "@/components/baseTables/hospitalProcedureGrouping/types";

interface ApiResponse<T> {
  data: T;
  meta?: any;
}

export default class HospitalProcedureGroupingService extends HttpService {
  async getHospitalProcedureGroupings(
    query_value?: string | number,
    query_props?: string,
    includes?: string
  ): Promise<{ content: HospitalProcedureGroupingListing[]; meta: any }> {
    try {
      const queryParams: string[] = [];

      if (query_value !== undefined && query_value !== null && query_value !== "" && query_props) {
        queryParams.push(`query_props=${encodeURIComponent(query_props)}`);
        queryParams.push(`query_value=${encodeURIComponent(String(query_value))}`);
      }

      if (includes) {
        queryParams.push(`includes=${encodeURIComponent(includes)}`);
      }

      const queryString = queryParams.length ? `?${queryParams.join("&")}` : "";
      const response = await this.get<ApiResponse<HospitalProcedureGroupingListing[]>>(
        `/administration/setup/hospital-procedure-grouping${queryString}`
      );
      return {
        content: response.data || [],
        meta: response.meta || {}
      };
    } catch (error) {
      console.error("Erro ao buscar hospital-procedure-grouping:", error);
      throw error;
    }
  }

  async getHospitalProcedureGroupingById(id: string | number): Promise<HospitalProcedureGroupingListing> {
    try {
      return await this.get<HospitalProcedureGroupingListing>(`/administration/setup/hospital-procedure-grouping/${id}`);
    } catch (error) {
      console.error("Erro ao buscar hospital-procedure-grouping por id:", error);
      throw error;
    }
  }

  async createHospitalProcedureGrouping(data: HospitalProcedureGroupingInsert): Promise<void> {
    try {
      await this.post("/administration/setup/hospital-procedure-grouping", data);
    } catch (error) {
      console.error("Erro ao criar hospital-procedure-grouping:", error);
      throw error;
    }
  }

  async deleteHospitalProcedureGrouping(id: string | number): Promise<void> {
    try {
      await this.delete(`/administration/setup/hospital-procedure-grouping/${id}`);
    } catch (error) {
      console.error("Erro ao deletar hospital-procedure-grouping:", error);
      throw error;
    }
  }
}
