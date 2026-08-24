import { computed, ref, watch, type ComputedRef } from "vue";

export const DEFAULT_REPORT_PREVIEW_ITEMS_PER_PAGE = 10;

export const useReportPreviewPagination = <T>(
  rows: ComputedRef<T[]>,
  defaultItemsPerPage = DEFAULT_REPORT_PREVIEW_ITEMS_PER_PAGE
) => {
  const page = ref(1);
  const itemsPerPage = ref(defaultItemsPerPage);

  const pageCount = computed(() => {
    return Math.max(1, Math.ceil(rows.value.length / itemsPerPage.value));
  });

  const paginatedRows = computed(() => {
    const start = (page.value - 1) * itemsPerPage.value;
    return rows.value.slice(start, start + itemsPerPage.value);
  });

  // Mantem a pagina sempre valida quando filtros ou tamanho da pagina mudam.
  watch([rows, itemsPerPage], () => {
    if (page.value > pageCount.value) page.value = pageCount.value;
    if (page.value < 1) page.value = 1;
  });

  return {
    page,
    itemsPerPage,
    pageCount,
    paginatedRows,
  };
};
