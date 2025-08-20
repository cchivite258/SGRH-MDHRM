<script lang="ts" setup>
import { getChartColorsArray } from "@/app/common/chartColorArray";
import { getCharts } from "@/components/dashboard/crm/utils";
import { ref, watch, computed } from "vue";
import { useLayoutStore } from "@/store/app";

const chart = ref<any>(getCharts(getChartColorsArray));
const syncStatusBreakdownChart = ref(chart.value.syncStatusBreakdownChart);
const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);

watch(layoutTheme, () => {
  syncStatusBreakdownChart.value = null;
  setTimeout(() => {
    const chartsVal = getCharts(getChartColorsArray);
    syncStatusBreakdownChart.value = chartsVal.syncStatusBreakdownChart;
  }, 200);
});
</script>
<template>
  <Card title="Sync Status Breakdown" class="h-100">
    <template #title-action>
      <ListMenu :listItems="['This Month', 'Last Month']" />
    </template>
    <v-card-text>
      <apexchart
        v-if="syncStatusBreakdownChart"
        class="apex-charts"
        height="350"
        dir="ltr"
        :series="syncStatusBreakdownChart.series"
        :options="syncStatusBreakdownChart.chartOptions"
      />
    </v-card-text>
  </Card>
</template>
