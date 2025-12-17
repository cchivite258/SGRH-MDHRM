import { defineStore } from 'pinia';
import { healthPlanEmployeeService } from "@/app/http/httpServiceProvider";
import type { HealthPlanListingType, ExpensePerProcedureType } from '@/components/employee/types';
import { co } from '@/assets/images/flags/utils';

export const useHealthPlanEmployeeStore = defineStore('healthPlans', {
  state: () => ({
    healthPlans: [] as HealthPlanListingType[],
    pagination: {
      totalElements: 0,
      currentPage: 0,
      itemsPerPage: 10,
      totalPages: 0
    },
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchHealthPlanEmployee(
      id: string | null,
      page?: number,
      size?: number,
      sortColumn: string = 'createdAt',
      direction: string = 'asc',
      query_value?: string,
      query_props?: string
    ) {
      this.loading = true;
      this.error = null;

      const actualPage = page ?? this.pagination.currentPage;
      const actualSize = size ?? this.pagination.itemsPerPage;

      try {
        const { content, meta } = await healthPlanEmployeeService.getHealthPlansByEmployee(
          id,
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );

        this.healthPlans = content;

        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };

      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar planos de saúde';
        this.healthPlans = [];
        this.pagination.totalElements = 0;
      } finally {
        this.loading = false;
      }
    },


    // Método para limpar os dados do store
    clearData() {
      this.healthPlans = [];
      this.pagination = {
        totalElements: 0,
        currentPage: 0,
        itemsPerPage: 10,
        totalPages: 0
      };
      this.error = null;
    }
  },

});