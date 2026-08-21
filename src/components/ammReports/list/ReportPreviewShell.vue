<script lang="ts" setup>
import ReportPreviewNavigator from "@/components/ammReports/list/ReportPreviewNavigator.vue";

defineProps<{
  currentReportId: string;
  report?: unknown;
}>();
</script>

<template>
  <div class="report-preview-shell">
    <section class="report-preview-header-card">
      <ReportPreviewNavigator
        :current-report-id="currentReportId"
        :report="report"
      />
    </section>

    <section class="report-preview-body-card">
      <div class="report-preview-shell-content">
        <slot />
      </div>
    </section>
  </div>
</template>

<style scoped>
.report-preview-shell {
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 1400px;
  margin: 18px auto 0;
  padding: 0 12px 24px;
}

.report-preview-header-card,
.report-preview-body-card {
  overflow: hidden;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 8px;
  background: rgb(var(--v-theme-surface));
  box-shadow: 0 8px 24px rgba(var(--v-theme-on-surface), 0.045);
}

.report-preview-header-card {
  border-color: rgba(var(--v-theme-primary), 0.12);
  box-shadow: 0 6px 18px rgba(var(--v-theme-on-surface), 0.04);
}

.report-preview-shell :deep(.report-preview-navigator-wrap) {
  max-width: none !important;
  padding: 0 !important;
}

.report-preview-shell :deep(.report-preview-navigator) {
  border: 0;
  border-radius: 0;
  background: rgb(var(--v-theme-surface));
  box-shadow: none;
  padding: 18px 20px;
}

.report-preview-shell-content :deep(.v-container) {
  max-width: none !important;
  padding: 0 24px 24px !important;
}

.report-preview-shell-content :deep(.header-container) {
  margin-bottom: 24px !important;
  padding: 18px 0 0 !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
}

/* Evita dois cabecalhos no topo: o titulo fica no card superior,
   enquanto o card de demonstracao preserva apenas data e accoes do relatorio. */
.report-preview-shell-content :deep(.header-container > .d-flex.justify-space-between > div:first-child) {
  display: none !important;
}

.report-preview-shell-content :deep(.header-container > .d-flex.justify-space-between) {
  flex-direction: row !important;
  flex-wrap: wrap !important;
  gap: 12px !important;
  align-items: center !important;
  justify-content: flex-end !important;
  margin-bottom: 12px !important;
}

@media (max-width: 700px) {
  .report-preview-shell {
    gap: 12px;
    margin-top: 12px;
    padding: 0 8px 18px;
  }

  .report-preview-shell :deep(.report-preview-navigator) {
    padding: 14px;
  }

  .report-preview-shell-content :deep(.v-container) {
    padding: 0 14px 18px !important;
  }

  .report-preview-shell-content :deep(.header-container > .d-flex.justify-space-between) {
    align-items: flex-end !important;
  }
}

@media print {
  .report-preview-shell {
    max-width: none;
    margin: 0;
    padding: 0;
  }

  .report-preview-header-card,
  .report-preview-body-card {
    overflow: visible;
    border: 0;
    box-shadow: none;
  }

  .report-preview-shell :deep(.report-preview-navigator-wrap) {
    display: none !important;
  }

  .report-preview-shell-content :deep(.header-container > .d-flex.justify-space-between > div:first-child) {
    display: block !important;
  }
}
</style>
