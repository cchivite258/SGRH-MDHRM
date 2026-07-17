import { defineStore } from "pinia";
import { reasonService } from "@/app/http/httpServiceProvider";
import type { ReasonInsert, ReasonListing, ReasonType } from "@/components/baseTables/reason/types";

export const useReasonStore = defineStore("reasons", {
  state: () => ({
    reasons: [] as ReasonListing[],
    reasonsByType: [] as ReasonListing[],
    pagination: {
      totalElements: 0,
      currentPage: 0,
      itemsPerPage: 10,
      totalPages: 0,
    },
    loading: false,
    error: null as string | null,
    draftReason: null as ReasonInsert | null,
    currentReasonId: null as string | null,
  }),

  actions: {
    async fetchReasons(
      page?: number,
      size?: number,
      sortColumn: string = "name",
      direction: string = "asc",
      query_value?: string,
      query_props?: string
    ) {
      this.loading = true;
      this.error = null;

      const actualPage = page ?? this.pagination.currentPage;
      const actualSize = size ?? this.pagination.itemsPerPage;

      try {
        const { content, meta } = await reasonService.getReasons(
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );

        this.reasons = content;
        this.pagination = {
          totalElements: meta.totalElements ?? content.length,
          currentPage: meta.page ?? actualPage,
          itemsPerPage: meta.size ?? actualSize,
          totalPages: meta.totalPages || Math.ceil((meta.totalElements ?? content.length) / (meta.size ?? actualSize)),
        };
      } catch (err: any) {
        this.error = err.message || "Erro ao buscar razões";
        this.reasons = [];
        this.pagination.totalElements = 0;
      } finally {
        this.loading = false;
      }
    },

    async fetchReasonsByType(type: ReasonType) {
      this.loading = true;
      this.error = null;

      try {
        const { content } = await reasonService.getReasonsByType(type);
        this.reasonsByType = content;
      } catch (err: any) {
        this.error = err.message || "Erro ao buscar razões por tipo";
        this.reasonsByType = [];
      } finally {
        this.loading = false;
      }
    },

    setDraftReason(data: ReasonInsert) {
      this.draftReason = data;
      localStorage.setItem("draftReason", JSON.stringify(data));
    },

    setCurrentReasonId(id: string) {
      this.currentReasonId = id;
      localStorage.setItem("currentReasonId", id);
    },

    clearDraft() {
      this.draftReason = null;
      this.currentReasonId = null;
      localStorage.removeItem("draftReason");
      localStorage.removeItem("currentReasonId");
    },

    loadFromStorage() {
      const draft = localStorage.getItem("draftReason");
      const id = localStorage.getItem("currentReasonId");
      if (draft) this.draftReason = JSON.parse(draft);
      if (id) this.currentReasonId = id;
    },
  },
});
