// stores/userStore.ts
import { defineStore } from 'pinia';
import { taxRateTypeService } from "@/app/http/httpServiceProvider";
import type { TaxRateTypeUpdate, TaxRateTypeListing, TaxRateTypeInsert } from "@/components/baseTables/TaxRate/types";

export const useTaxRateStore = defineStore('tax_rates', {
  state: () => ({
    tax_rates: [] as TaxRateTypeListing[],
    tax_rates_for_dropdown: [] as TaxRateTypeListing[],
    pagination: {
      totalElements: 0,
      currentPage: 0,
      itemsPerPage: 10,
      totalPages: 0
    },
    loading: false,
    error: null as string | null,
    draftTaxRate: null as TaxRateTypeInsert | null,
    currentTaxRateId: null as string | null
  }),

  actions: {
    async fetchTaxRates(
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
        const { content, meta } = await taxRateTypeService.getTaxRates(
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );

        this.tax_rates = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };

        console.log('🏛️ Tax Rates:', this.tax_rates);
        console.log('📄 Meta:', this.pagination);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar tax rates';
        this.tax_rates = [];
        this.pagination.totalElements = 0;
        console.error("❌ Erro ao buscar tax_rates:", err);
      } finally {
        this.loading = false;
      }
    },

    async fetchTaxRatesForDropdown(
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
        const { content, meta } = await taxRateTypeService.getTaxRatesForDropdown(
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );

        this.tax_rates_for_dropdown = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };

        console.log('🏛️ Tax Rates:', this.tax_rates_for_dropdown);
        console.log('📄 Meta:', this.pagination);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar tax rates';
        this.tax_rates_for_dropdown = [];
        this.pagination.totalElements = 0;
        console.error("❌ Erro ao buscar tax_rates:", err);
      } finally {
        this.loading = false;
      }
    },

    setDraftInstitutionType(data: TaxRateTypeInsert) {
      this.draftTaxRate = data;
      localStorage.setItem('draftTaxRate', JSON.stringify(data));
      console.log('📋 Draft de tipo de instituição salvo:', this.draftTaxRate);
    },

    setCurrentTaxRateId(id: string) {
      this.currentTaxRateId = id;
      localStorage.setItem('CurrentTaxRateId', id);
      console.log('🆔 ID do tipo de TaxRate atual salvo:', this.currentTaxRateId);
    },

    clearDraft() {
      this.draftTaxRate = null;
      this.currentTaxRateId = null;
      localStorage.removeItem('draftTaxRate');
      localStorage.removeItem('CurrentTaxRateId');
      console.log('🧹 Draft e ID de tipo de TaxRate limpos');
    },

    loadFromStorage() {
      const draft = localStorage.getItem('draftTaxRate');
      const id = localStorage.getItem('CurrentTaxRateId');
      if (draft) this.draftTaxRate = JSON.parse(draft);
      if (id) this.currentTaxRateId = id;
      console.log('📦 Carregado do armazenamento:', this.draftTaxRate, this.currentTaxRateId);
    }
  }
});
