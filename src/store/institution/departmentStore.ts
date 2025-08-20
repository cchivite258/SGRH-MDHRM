// stores/departmentStore.ts
import { defineStore } from 'pinia';
import { departmentService } from "@/app/http/httpServiceProvider";
import type { DepartmentListingType, DepartmentListingForListType } from '@/components/institution/types';

export const useDepartmentStore = defineStore('departments', { 
  state: () => ({
    departments: [] as DepartmentListingType[],
    departmentsList: [] as DepartmentListingForListType[],
    pagination: { 
      totalElements: 0,
      currentPage: 0,
      itemsPerPage: 10000000, 
      totalPages: 0
    },
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchDepartments(
      id: string | number | null,
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
        const { content, meta } = await departmentService.getDepartmentsByInstitution(
          id,
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );
    
        this.departments = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };
        console.log('Departamentos:', this.departments);
        console.log('Meta:', this.pagination);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar departamentos';
        console.error("❌ Erro ao buscar departamentos:", err);
        this.departments = [];
        this.pagination.totalElements = 0;
      } finally {
        this.loading = false;
      }
    },
    async fetchDepartmentsForList(
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
        const { content, meta } = await departmentService.getDepartmentsByInstitutionList(
          id,
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );
    
        this.departmentsList = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };
        console.log('Departamentos:', this.departmentsList);
        console.log('Meta:', this.pagination);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar departamentos';
        console.error("❌ Erro ao buscar departamentos:", err);
        this.departmentsList = [];
        this.pagination.totalElements = 0;
      } finally {
        this.loading = false;
      }
    }
    
  }
});