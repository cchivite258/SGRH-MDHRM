<script type="ts" setup>
import { getChartColorsArray } from "@/app/common/chartColorArray";
import {getCharts} from "@/components/apexCharts/boxplot/utils";
import { ref, watch, computed } from "vue";
// const {boxChart, boxplotScatterChart } = getCharts(getChartColorsArray);

import { useLayoutStore } from "@/store/app";

const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);

const charts = ref(getCharts(getChartColorsArray));
const boxChart = ref(charts.value.boxChart);
const boxplotScatterChart = ref(charts.value.boxplotScatterChart);

watch(layoutTheme, () => {
  boxChart.value = null;
  boxplotScatterChart.value = null;
  setTimeout(() => {
    const chartsVal = getCharts(getChartColorsArray);
    boxChart.value = chartsVal.boxChart;
    boxplotScatterChart.value = chartsVal.boxplotScatterChart;
  }, 200);
});
</script>

<template>
  <v-row>
    <v-col cols="12" lg="6">
      <Card title="Basic Box Chart">
        <v-card-text>
          <apexchart
            v-if="boxChart"
            class="apex-charts"
            height="350"
            dir="ltr"
            :series="boxChart.series"
            :options="boxChart.chartOptions"
          />
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Boxplot with Scatter Chart">
        <v-card-text>
          <apexchart
            v-if="boxplotScatterChart"
            class="apex-charts"
            height="350"
            dir="ltr"
            :series="boxplotScatterChart.series"
            :options="boxplotScatterChart.chartOptions"
          />
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
</template>
