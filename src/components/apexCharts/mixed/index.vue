<script type="ts" setup>
import { ref, watch, computed } from "vue";
import { getChartColorsArray } from "@/app/common/chartColorArray";
import { getCharts } from '@/components/apexCharts/mixed/utils'

import { useLayoutStore } from "@/store/app";

const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);

const charts = ref(getCharts(getChartColorsArray));
const mixedLineChart = ref(charts.value.mixedLineChart);
const yAxisChart = ref(charts.value.yAxisChart);
const lineAreaChart = ref(charts.value.lineAreaChart);
const lineColumnAreaChart = ref(charts.value.lineColumnAreaChart);

watch(layoutTheme, () => {
  mixedLineChart.value = null;
  yAxisChart.value = null;
  lineAreaChart.value = null;
  lineColumnAreaChart.value = null;
  setTimeout(() => {
    const chartsVal = getCharts(getChartColorsArray);
    mixedLineChart.value = chartsVal.mixedLineChart;
    yAxisChart.value = chartsVal.yAxisChart;
    lineAreaChart.value = chartsVal.lineAreaChart;
    lineColumnAreaChart.value = chartsVal.lineColumnAreaChart;
  }, 200);
});
</script>

<template>
  <v-row>
    <v-col cols="12" lg="6">
      <Card title="Line & Column Chart">
        <v-card-text>
          <apexchart
            v-if="mixedLineChart"
            class="apex-charts"
            height="350"
            dir="ltr"
            :series="mixedLineChart.series"
            :options="mixedLineChart.chartOptions"
          />
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Multiple Y-Axis Chart">
        <v-card-text>
          <apexchart
            v-if="yAxisChart"
            class="apex-charts"
            height="350"
            dir="ltr"
            :series="yAxisChart.series"
            :options="yAxisChart.chartOptions"
          />
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Line & Area Chart">
        <v-card-text>
          <apexchart
            v-if="lineAreaChart"
            class="apex-charts"
            height="350"
            dir="ltr"
            :series="lineAreaChart.series"
            :options="lineAreaChart.chartOptions"
          />
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Line, Column & Area Chart">
        <v-card-text>
          <apexchart
            v-if="lineColumnAreaChart"
            class="apex-charts"
            height="350"
            dir="ltr"
            :series="lineColumnAreaChart.series"
            :options="lineColumnAreaChart.chartOptions"
          />
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
</template>
