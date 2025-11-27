// stores/budgetStore.ts
import { defineStore } from 'pinia';
import { budgetService } from "@/app/http/httpServiceProvider";
import type { BudgetListingType } from '@/components/institution/types';

export const useBudgetStore = defineStore('budgets', {
  state: () => ({
    budgets: [] as BudgetListingType[],
    budgets_for_dropdown: [] as BudgetListingType[],
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
    async fetchBudgets(
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
        const { content, meta } = await budgetService.getBudgetByCoveragePeriod(
          id,
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );

        this.budgets = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };
        console.log('Orçamentos:', this.budgets);
        console.log('Meta:', this.pagination);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar orcamentos';
        console.error("❌ Erro ao buscar orcamentos:", err);
        this.budgets = [];
        this.pagination.totalElements = 0;
      } finally {
        this.loading = false;
      }
    },
    async fetchBudgetsForDropdown(
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
        const { content, meta } = await budgetService.getBudgetByCoveragePeriodForDropdown(
          id,
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );

        // 🔥 GARANTIR ARRAY
        this.budgets_for_dropdown = Array.isArray(content)
          ? content
          : content
            ? [content]
            : [];

        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };

        console.log('Orçamentos:', this.budgets_for_dropdown);
        console.log('Meta:', this.pagination);

      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar orçamentos';
        console.error("❌ Erro ao buscar orcamentos:", err);

        this.budgets_for_dropdown = [];
        this.pagination.totalElements = 0;

      } finally {
        this.loading = false;
      }
    }


  },
  getters: {
    enabledBudgets: (state) => {
      return state.budgets_for_dropdown.filter(item => item.enabled === true)
    }
  }

});