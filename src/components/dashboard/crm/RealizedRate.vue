<script lang="ts" setup>
import { getChartColorsArray } from "@/app/common/chartColorArray";
import { getCharts } from "@/components/dashboard/crm/utils";
import { ref, watch, computed } from "vue";
import { useLayoutStore } from "@/store/app";
const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);

const chart = ref<any>(getCharts(getChartColorsArray));
const realizedRateChart = ref(chart.value.realizedRateChart);

watch(layoutTheme, () => {
  realizedRateChart.value = null;
  setTimeout(() => {
    const chartsVal = getCharts(getChartColorsArray);
    realizedRateChart.value = chartsVal.realizedRateChart;
  }, 200);
});
</script>
<template>
  <Card title="Realized Rate" class="h-100">
    <template #title-action>
      <ListMenu isIcon :listItems="['Current Years', 'Last Years']" />
    </template>
    <v-card-text>
      <apexchart
        v-if="realizedRateChart"
        class="apex-charts"
        height="380"
        dir="ltr"
        :series="realizedRateChart.series"
        :options="realizedRateChart.chartOptions"
      />
    </v-card-text>
  </Card>
</template>
