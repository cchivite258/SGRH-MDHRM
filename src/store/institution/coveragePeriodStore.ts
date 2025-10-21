// stores/departmentStore.ts
import { defineStore } from 'pinia';
import { coveragePeriodsService } from "@/app/http/httpServiceProvider";
import type { CoveragePeriodListingType } from '@/components/institution/types';

export const useCoveragePeriodStore = defineStore('coverage_periods', { 
  state: () => ({
    coverage_periods: [] as CoveragePeriodListingType[],
    coverage_periods_for_dropdown: [] as CoveragePeriodListingType[],
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
    async fetchCoveragePeriods(
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
        const { content, meta } = await coveragePeriodsService.getCoveragePeriodByInstitution(
          id,
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );
    
        this.coverage_periods = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };
        console.log('Periodos de cobertura:', this.coverage_periods);
        console.log('Meta:', this.pagination);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar periodos de cobertura';
        console.error("❌ Erro ao buscar periodos de cobertura:", err);
        this.coverage_periods = [];
        this.pagination.totalElements = 0;
      } finally {
        this.loading = false;
      }
    },
    async fetchCoveragePeriodsForDropdown(
      id: string | undefined,
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
        const { content, meta } = await coveragePeriodsService.getCoveragePeriodByInstitutionForDropdown(
          id,
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );
    
        this.coverage_periods_for_dropdown = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };
        console.log('Periodos de cobertura:', this.coverage_periods_for_dropdown);
        console.log('Meta:', this.pagination);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar periodos de cobertura';
        console.error("❌ Erro ao buscar periodos de cobertura:", err);
        this.coverage_periods_for_dropdown = [];
        this.pagination.totalElements = 0;
      } finally {
        this.loading = false;
      }
    }
    
  },
  getters: {
    enabledCoveragePeriods: (state) => {
      return state.coverage_periods_for_dropdown.filter(item => item.enabled === true) 
    }
  }
  
});