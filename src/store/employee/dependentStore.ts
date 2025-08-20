// stores/departmentStore.ts
import { defineStore } from 'pinia';
import { dependentEmployeeService } from "@/app/http/httpServiceProvider";
import type { DependentListingType } from '@/components/employee/types';

export const useDependentEmployeeStore = defineStore('dependents', { 
  state: () => ({
    dependents: [] as DependentListingType[],
    dependentsForDropdown: [] as DependentListingType[],
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
    async fetchDependentsEmployee(
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
        const { content, meta } = await dependentEmployeeService.getDependentbyEmployee(
          id,
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );
    
        this.dependents = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };
        console.log('Dependentes:', this.dependents);
        console.log('Meta:', this.pagination);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar dependentes';
        console.error("❌ Erro ao buscar dependentes:", err);
        this.dependents = [];
        this.pagination.totalElements = 0;
      } finally {
        this.loading = false;
      }
    },
    async fetchDependentsEmployeeForDropdown(
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
        const { content, meta } = await dependentEmployeeService.getDependentbyEmployeeForDropdown(
          id,
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );
    
        this.dependentsForDropdown = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };
        console.log('Dependentes:', this.dependentsForDropdown);
        console.log('Meta:', this.pagination);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar dependentes';
        console.error("❌ Erro ao buscar dependentes:", err);
        this.dependentsForDropdown = [];
        this.pagination.totalElements = 0;
      } finally {
        this.loading = false;
      }
    },
    clearDependentForDropdown() {
      this.dependentsForDropdown = [];
    }
    
  }
});