<script lang="ts" setup>
import { getChartColorsArray } from "@/app/common/chartColorArray";
import { getCharts } from "@/components/dashboard/eCommerce/utils";
import { ref, watch, computed } from "vue";
import { useLayoutStore } from "@/store/app";

const charts = ref<any>(getCharts(getChartColorsArray));
const trafficSourceChart = ref(charts.value.trafficSourceChart);
const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);

watch(layoutTheme, () => {
  trafficSourceChart.value = null;
  setTimeout(() => {
    const chartsVal = getCharts(getChartColorsArray);
    trafficSourceChart.value = chartsVal.trafficSourceChart;
  }, 200);
});
</script>
<template>
  <Card title="Traffic Source" class="h-100">
    <template #title-action>
      <ListMenu
        isIcon
        :listItems="['Today', 'Last Week', 'Last Month', 'Current Year']"
      />
    </template>
    <v-card-text>
      <apexchart
        v-if="trafficSourceChart"
        class="apex-charts"
        height="340"
        dir="ltr"
        :series="trafficSourceChart.series"
        :options="trafficSourceChart.chartOptions"
      />
    </v-card-text>
  </Card>
</template>
