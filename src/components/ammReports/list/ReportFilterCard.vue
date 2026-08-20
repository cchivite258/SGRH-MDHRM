<script lang="ts" setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { reports } from "@/components/ammReports/list/utils";

const props = withDefaults(defineProps<{
  reportId: string;
  titleClass?: string;
}>(), {
  titleClass: "py-0",
});

const { t } = useI18n();

// O catalogo de relatorios e a fonte unica para titulos de modais.
// Para replicar, adicione o relatorio em utils.ts e passe o seu id aqui.
const title = computed(() => {
  const report = reports.find((item) => item.id === props.reportId);
  const reportTitle = report ? t(`t-${report.title}`) : t("t-report");
  return `${t("t-filters")} - ${reportTitle}`;
});
</script>

<template>
  <Card :title="title" :title-class="titleClass">
    <template #title-action>
      <slot name="title-action" />
    </template>

    <slot />
  </Card>
</template>
