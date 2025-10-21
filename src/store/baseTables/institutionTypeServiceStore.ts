// stores/userStore.ts
import { defineStore } from 'pinia';
import { institutionTypeService } from "@/app/http/httpServiceProvider";
import type { InstitutionTypeUpdate, InstitutionTypeListing, InstitutionTypeInsert } from "@/components/baseTables/institutionTypes/types";

export const useInstitutionTypeStore = defineStore('institution_types', {
  state: () => ({
    institution_types: [] as InstitutionTypeListing[],
    pagination: {
      totalElements: 0,
      currentPage: 0,
      itemsPerPage: 10,
      totalPages: 0
    },
    loading: false,
    error: null as string | null,
    draftInstitutionType: null as InstitutionTypeInsert | null,
    currentInstitutionTypeId: null as string | null
  }),

  actions: {
    async fetchInstitutionTypes(
      page?: number,
      size?: number,
      sortColumn: string = 'name',
      direction: string = 'asc',
      query_value?: string,
      query_props?: string
    ) {
      this.loading = true;
      this.error = null;

      const actualPage = page ?? this.pagination.currentPage;
      const actualSize = size ?? this.pagination.itemsPerPage;

      try {
        const { content, meta } = await institutionTypeService.getInstitutionTypes(
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );

        this.institution_types = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };

        console.log('🏛️ Tipos de Instituições:', this.institution_types);
        console.log('📄 Meta:', this.pagination);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar os tipos de instituições';
        this.institution_types = [];
        this.pagination.totalElements = 0;
        console.error("❌ Erro ao buscar institution_types:", err);
      } finally {
        this.loading = false;
      }
    },

    setDraftInstitutionType(data: InstitutionTypeInsert) {
      this.draftInstitutionType = data;
      localStorage.setItem('draftInstitutionType', JSON.stringify(data));
      console.log('📋 Draft de tipo de instituição salvo:', this.draftInstitutionType);
    },

    setCurrentInstitutionTypeId(id: string) {
      this.currentInstitutionTypeId = id;
      localStorage.setItem('currentInstitutionTypeId', id);
      console.log('🆔 ID do tipo de instituição atual salvo:', this.currentInstitutionTypeId);
    },

    clearDraft() {
      this.draftInstitutionType = null;
      this.currentInstitutionTypeId = null;
      localStorage.removeItem('draftInstitutionType');
      localStorage.removeItem('currentInstitutionTypeId');
      console.log('🧹 Draft e ID de tipo de instituição limpos');
    },

    loadFromStorage() {
      const draft = localStorage.getItem('draftInstitutionType');
      const id = localStorage.getItem('currentInstitutionTypeId');
      if (draft) this.draftInstitutionType = JSON.parse(draft);
      if (id) this.currentInstitutionTypeId = id;
      console.log('📦 Carregado do armazenamento:', this.draftInstitutionType, this.currentInstitutionTypeId);
    }
  }
});
