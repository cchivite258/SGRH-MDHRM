import { defineStore } from 'pinia';
import { institutionService } from "@/app/http/httpServiceProvider";
import type { InstitutionListingType, InstitutionInsertType } from '@/components/institution/types';

export const useInstitutionStore = defineStore('institutions', {
  state: () => ({
    institutions: [] as InstitutionListingType[],
    institutions_for_dropdown: [] as InstitutionListingType[],
    pagination: {
      totalElements: 0,
      currentPage: 0,
      itemsPerPage: 10,
      totalPages: 0
    },
    loading: false,
    error: null as string | null,
    globalSearch: '',
    advancedFilters: [] as {
      prop: string;
      operator: string;
      value: string | boolean | Date;
    }[],
    logicalOperator: 'AND' as 'AND' | 'OR',
    // Draft institution for form handling
    draftInstitution: null as InstitutionInsertType | null,
    currentInstitutionId: null as string | null
  }),

  actions: {
    async fetchInstitutions(
      page?: number,
      size?: number,
      sortColumn: string = 'createdAt',
      direction: string = 'asc'
    ) {
      this.loading = true;
      this.error = null;

      const actualPage = page ?? this.pagination.currentPage;
      const actualSize = size ?? this.pagination.itemsPerPage;

      try {
        const { content, meta } = await institutionService.getInstitutions(
          actualPage,
          actualSize,
          sortColumn,
          direction,
          this.globalSearch,
          this.advancedFilters,
          this.logicalOperator
        );

        this.institutions = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };
        console.log('Instituições:', this.institutions);
        console.log('Meta:', this.pagination);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar instituições';
        console.error("❌ Erro ao buscar instituições:", err);
        this.institutions = [];
        this.pagination.totalElements = 0;
      } finally {
        this.loading = false;
      }
    },
    
    setGlobalSearch(search: string) {
      this.globalSearch = search;
    },

    setAdvancedFilters(filters: {
      prop: string ;
      operator: string;
      value: string | boolean | Date;
    }[]) {
      this.advancedFilters = filters;
      console.log('Advanced filters set:', this.advancedFilters);
    },

    setLogicalOperator(operator: 'AND' | 'OR') {
      this.logicalOperator = operator;
    },

    clearFilters() {
      this.globalSearch = '';
      this.advancedFilters = [];
      this.logicalOperator = 'AND';
    },

    async fetchInstitutionsforListing(
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
        const { content, meta } = await institutionService.getInstitutionsForListing( 
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );

        this.institutions_for_dropdown = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };
        console.log('Instituições:', this.institutions_for_dropdown);
        console.log('Meta:', this.pagination);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar instituições';
        console.error("❌ Erro ao buscar instituições:", err);
        this.institutions_for_dropdown = [];
        this.pagination.totalElements = 0;
      } finally {
        this.loading = false;
      }
    },
    setDraftInstitution(data: InstitutionInsertType) {
      this.draftInstitution = data;
      localStorage.setItem('institutionDraft', JSON.stringify(data));
    },
    setCurrentInstitutionId(id: string) {
      this.currentInstitutionId = id;
      localStorage.setItem('currentInstitutionId', id);
    },
    clearDraft() {
      this.draftInstitution = null;
      this.currentInstitutionId = null;
      localStorage.removeItem('institutionDraft');
      localStorage.removeItem('currentInstitutionId'); 
    },
    loadFromStorage() {
      const draft = localStorage.getItem('institutionDraft');
      const id = localStorage.getItem('currentInstitutionId');
      if (draft) this.draftInstitution = JSON.parse(draft);
      if (id) this.currentInstitutionId = id;
    }
  },
    getters: {
    enabledInstitutions: (state) => {
      return state.institutions_for_dropdown.filter(item => item.enabled === true) 
    }
  }
});
