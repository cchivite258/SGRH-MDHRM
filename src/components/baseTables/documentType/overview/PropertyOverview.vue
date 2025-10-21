<script lang="ts" setup>
import { getChartColorsArray } from "@/app/common/chartColorArray";
import { ref, watch, computed } from "vue";
import { getCharts } from "@/components/realEstate/agent/overview/utils";

import { useLayoutStore } from "@/store/app";
const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);

const chart = ref<any>(getCharts(getChartColorsArray));
const agentOverviewChart = ref(chart.value.agentOverviewChart);

watch(layoutTheme, () => {
  agentOverviewChart.value = null;
  setTimeout(() => {
    const chartsVal = getCharts(getChartColorsArray);
    agentOverviewChart.value = chartsVal.agentOverviewChart;
  }, 200);
});
const overviewType = ref(3);
const btnList = ref(["ALL", "1M", "6M", "1Y"]);
</script>
<template>
  <Card title="Property Overview">
    <template #title-action>
      <v-btn-toggle
        v-model="overviewType"
        color="primary"
        variant="tonal"
        height="27"
      >
        <v-btn
          size="x-small"
          class="me-1"
          height="27"
          rounded
          v-for="btn in btnList"
          :key="btn"
        >
          {{ btn }}
        </v-btn>
      </v-btn-toggle>
    </template>
    <v-card-text>
      <apexchart
        v-if="agentOverviewChart"
        class="apex-charts"
        height="400"
        dir="ltr"
        :series="agentOverviewChart.series"
        :options="agentOverviewChart.chartOptions"
      />
    </v-card-text>
  </Card>
</template>
