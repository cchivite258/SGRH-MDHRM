// stores/departmentStore.ts
import { defineStore } from 'pinia';
import { contactPersonService } from "@/app/http/httpServiceProvider";
import type { ContactPersonListingType } from '@/components/institution/types';

export const useContactPersonStore = defineStore('contact_persons', { 
  state: () => ({
    contact_persons: [] as ContactPersonListingType[],
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
    async fetchContactPersons(
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
        const { content, meta } = await contactPersonService.getContactPersonByInstitution(
          id,
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );
    
        this.contact_persons = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };
        console.log('Pessoas de contacto:', this.contact_persons);
        console.log('Meta:', this.pagination);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar pessoas de contacto';
        console.error("❌ Erro ao buscar pessoas de contacto:", err);
        this.contact_persons = [];
        this.pagination.totalElements = 0;
      } finally {
        this.loading = false;
      }
    }
    
  }
});