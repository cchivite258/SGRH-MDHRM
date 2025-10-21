<script lang="ts" setup>
import { getChartColorsArray } from "@/app/common/chartColorArray";
import { getCharts } from "@/components/dashboard/crm/utils";

import { ref, watch, computed } from "vue";
import { useLayoutStore } from "@/store/app";

const chart = ref<any>(getCharts(getChartColorsArray));
const usersActivityChart = ref(chart.value.usersActivityChart);
const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);

watch(layoutTheme, () => {
  usersActivityChart.value = null;
  setTimeout(() => {
    const chartsVal = getCharts(getChartColorsArray);
    usersActivityChart.value = chartsVal.usersActivityChart;
  }, 200);
});
</script>
<template>
  <Card title="Users Activity" class="h-100">
    <template #title-action>
      <ListMenu :listItems="['This Month', 'Last Month']" />
    </template>
    <v-card-text>
      <apexchart
        v-if="usersActivityChart"
        class="apex-charts"
        height="330"
        dir="ltr"
        :series="usersActivityChart.series"
        :options="usersActivityChart.chartOptions"
      />
    </v-card-text>
  </Card>
</template>
