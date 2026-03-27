// stores/departmentStore.ts
import { defineStore } from 'pinia';
import { healthPlanService } from "@/app/http/httpServiceProvider";
import type { HealthPlanListingType } from '@/components/institution/types';

export const useHealthPlanStore = defineStore('health_plans', { 
  state: () => ({
    health_plans: [] as HealthPlanListingType[],
    health_plans_for_dropdown: [] as HealthPlanListingType[],
    activeHealthPlan: undefined as any,
    pagination: { 
      totalElements: 0,
      currentPage: 0,
      itemsPerPage: 5, 
      totalPages: 0
    },
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchHealthPlans(
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
        const { content, meta } = await healthPlanService.getHealthPlanByInstitution(
          id,
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );
    
        this.health_plans = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };
        console.log('Planos de saúde:', this.health_plans);
        console.log('Meta:', this.pagination);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar planos de saúde';
        console.error("❌ Erro ao buscar planos de saúde:", err);
        this.health_plans = [];
        this.pagination.totalElements = 0;
      } finally {
        this.loading = false;
      }
    },
    async fetchHealthPlansForDropdown(
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
        const { content, meta } = await healthPlanService.getHealthPlanByInstitution(
          id,
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );
    
        this.health_plans_for_dropdown = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };
        console.log('Planos de saúde:', this.health_plans_for_dropdown);
        console.log('Meta:', this.pagination);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar planos de saúde';
        console.error("❌ Erro ao buscar planos de saúde:", err);
        this.health_plans_for_dropdown = [];
        this.pagination.totalElements = 0;
      } finally {
        this.loading = false;
      }
    },
    async fetchActiveHealthPlan(companyId: string) {
      this.loading = true;
      try {
        const response = await healthPlanService.getActiveHealthPlanByCompany(companyId);
        this.activeHealthPlan = response.data;
        return response.data;
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch active health plan';
        throw error;
      } finally {
        this.loading = false;
      }
    }
    
  }
});
