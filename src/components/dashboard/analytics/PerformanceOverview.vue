<script lang="ts" setup>
import { ref, watch, computed } from "vue";
import { getChartColorsArray } from "@/app/common/chartColorArray";
import { getCharts } from "@/components/dashboard/analytics/utils";
import { useLayoutStore } from "@/store/app";

const charts = ref<any>(getCharts(getChartColorsArray));
const pageViewChart = ref(charts.value.pageViewChart);
const clicksChart = ref(charts.value.clicksChart);
const conversationsChart = ref(charts.value.conversationsChart);

const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);

const tab = ref(null);
const tabs = [
  {
    title: "Page views",
    value: "pageView",
  },
  {
    title: "Clicks",
    value: "clicks",
  },
  {
    title: "Conversations",
    value: "conversations",
  },
];

watch(layoutTheme, () => {
  pageViewChart.value = null;
  clicksChart.value = null;
  conversationsChart.value = null;
  setTimeout(() => {
    const chartsVal = getCharts(getChartColorsArray);
    pageViewChart.value = chartsVal.pageViewChart;
    clicksChart.value = chartsVal.clicksChart;
    conversationsChart.value = chartsVal.conversationsChart;
  }, 200);
});
</script>
<template>
  <Card title="Performance Overview" class="h-100">
    <template #title-action>
      <v-tabs v-model="tab" color="primary" hide-slider>
        <v-tab
          v-for="item in tabs"
          :key="item.value"
          :value="item.value"
          class="text-none rounded-sm"
          variant="flat"
          rounded
          density="compact"
        >
          {{ item.title }}
        </v-tab>
      </v-tabs>
    </template>
    <v-window v-model="tab">
      <v-window-item value="pageView">
        <apexchart
          v-if="pageViewChart"
          class="apex-charts"
          height="373"
          dir="ltr"
          :redrawOnWindowResize="true"
          :series="pageViewChart.series"
          :options="pageViewChart.chartOptions"
        />
      </v-window-item>
      <v-window-item value="clicks">
        <apexchart
          v-if="clicksChart"
          class="apex-charts"
          height="373"
          dir="ltr"
          :series="clicksChart.series"
          :options="clicksChart.chartOptions"
        />
      </v-window-item>
      <v-window-item value="conversations">
        <apexchart
          v-if="conversationsChart"
          class="apex-charts"
          height="373"
          dir="ltr"
          :series="conversationsChart.series"
          :options="conversationsChart.chartOptions"
        />
      </v-window-item>
    </v-window>
  </Card>
</template>
