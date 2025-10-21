<script lang="ts" setup>
import { getChartColorsArray } from "@/app/common/chartColorArray";
import { getCharts } from "@/components/dashboard/learning/utils";
import { ref, watch, computed } from "vue";
import { useLayoutStore } from "@/store/app";

const chart = ref<any>(getCharts(getChartColorsArray));
const dailyProgressChart = ref(chart.value.dailyProgressChart);
const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);

watch(layoutTheme, () => {
  dailyProgressChart.value = null;
  setTimeout(() => {
    const chartsVal = getCharts(getChartColorsArray);
    dailyProgressChart.value = chartsVal.dailyProgressChart;
  }, 200);
});
</script>
<template>
  <Card title="Daily Progress" class="h-100">
    <template #title-action>
      <ListMenu :listItems="['Today', 'This Month', 'Last Month']" />
    </template>
    <v-card-text class="text-center">
      <apexchart
        v-if="dailyProgressChart"
        class="apex-charts"
        height="315"
        dir="ltr"
        :series="dailyProgressChart.series"
        :options="dailyProgressChart.chartOptions"
      />
      <p class="text-muted mb-0">
        Very good, keep improving the quality of your learning
      </p>
    </v-card-text>
  </Card>
</template>
