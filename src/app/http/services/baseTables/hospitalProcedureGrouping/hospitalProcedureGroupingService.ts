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
  async getHospitalProcedureGroupings(): Promise<{ content: HospitalProcedureGroupingListing[]; meta: any }> {
    try {
      const response = await this.get<ApiResponse<HospitalProcedureGroupingListing[]>>("/administration/setup/hospital-procedure-grouping");
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
