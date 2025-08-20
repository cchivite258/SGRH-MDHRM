<script lang="ts" setup>
import { ref, watch, computed } from "vue";
import { getChartColorsArray } from "@/app/common/chartColorArray";
import { useLayoutStore } from "@/store/app";
const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);

import { getCharts } from "@/components/learning/instructors/overview/utils";
const charts = ref<any>(getCharts(getChartColorsArray));
const studentActivityChart = ref(charts.value.studentActivityChart);

watch(layoutTheme, () => {
  studentActivityChart.value = null;
  setTimeout(() => {
    const chartsVal = getCharts(getChartColorsArray);
    studentActivityChart.value = chartsVal.studentActivityChart;
  }, 200);
});
</script>
<template>
  <Card title="Student Activity" class="h-100">
    <v-card-text>
      <apexchart
        v-if="studentActivityChart"
        class="apex-charts"
        height="350"
        dir="ltr"
        :series="studentActivityChart.series"
        :options="studentActivityChart.chartOptions"
      />
    </v-card-text>
  </Card>
</template>
