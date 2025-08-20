<script type="ts" setup>
import { ref, watch, computed } from "vue";
import { getChartColorsArray } from "@/app/common/chartColorArray";
import { getCharts } from '@/components/apexCharts/radialbar/utils'
import { useLayoutStore } from "@/store/app";

const charts = ref(getCharts(getChartColorsArray));

const basicRadialBarChart = ref(charts.value.basicRadialBarChart)
const multiRadialbarChart = ref(charts.value.multiRadialbarChart)
const circleAngleChart = ref(charts.value.circleAngleChart)
const gradientRadialbarChart = ref(charts.value.gradientRadialbarChart)
const strokedRadialbarChart = ref(charts.value.strokedRadialbarChart)
const semiRadialbarChart = ref(charts.value.semiRadialbarChart)

const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);

watch(layoutTheme, () => {
  basicRadialBarChart.value = null;
  setTimeout(() => {
    const chartsVal = getCharts(getChartColorsArray);
    basicRadialBarChart.value = chartsVal.basicRadialBarChart;
    multiRadialbarChart.value = chartsVal.multiRadialbarChart;
    circleAngleChart.value = chartsVal.circleAngleChart;
    gradientRadialbarChart.value = chartsVal.gradientRadialbarChart;
    strokedRadialbarChart.value = chartsVal.strokedRadialbarChart;
    semiRadialbarChart.value = chartsVal.semiRadialbarChart;
  }, 200);
});
</script>

<template>
  <v-row>
    <v-col cols="12" md="6">
      <Card title="Simple Radialbar Chart">
        <v-card-text>
          <apexchart
            v-if="basicRadialBarChart"
            class="apex-charts"
            height="350"
            dir="ltr"
            :series="basicRadialBarChart.series"
            :options="basicRadialBarChart.chartOptions"
          ></apexchart>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" md="6">
      <Card title="Multiple Radialbar">
        <v-card-text>
          <div id="multiple_radialbar" class="apex-charts" dir="ltr"></div>
          <apexchart
            v-if="multiRadialbarChart"
            class="apex-charts"
            height="350"
            dir="ltr"
            :series="multiRadialbarChart.series"
            :options="multiRadialbarChart.chartOptions"
          ></apexchart>
        </v-card-text>
      </Card>
    </v-col>
  </v-row>

  <v-row>
    <v-col cols="12" md="6">
      <Card title="Circle Chart - Custom Angle">
        <v-card-text>
          <apexchart
            v-if="circleAngleChart"
            class="apex-charts"
            height="350"
            dir="ltr"
            :series="circleAngleChart.series"
            :options="circleAngleChart.chartOptions"
          ></apexchart>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" md="6">
      <Card title="Gradient Circle Chart">
        <v-card-text>
          <apexchart
            v-if="gradientRadialbarChart"
            class="apex-charts"
            height="350"
            dir="ltr"
            :series="gradientRadialbarChart.series"
            :options="gradientRadialbarChart.chartOptions"
          ></apexchart>
        </v-card-text>
      </Card>
    </v-col>
  </v-row>

  <v-row class="mb-4">
    <v-col cols="12" md="6">
      <Card title="Stroked Circular Gauge" class="h-100 mb-xl-0">
        <v-card-text>
          <apexchart
            v-if="strokedRadialbarChart"
            class="apex-charts"
            height="350"
            dir="ltr"
            :series="strokedRadialbarChart.series"
            :options="strokedRadialbarChart.chartOptions"
          ></apexchart>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" md="6">
      <Card title="Semi Circular Gauge" class="h-100 mb-xl-0">
        <v-card-text>
          <apexchart
            v-if="semiRadialbarChart"
            class="apex-charts"
            height="350"
            dir="ltr"
            :series="semiRadialbarChart.series"
            :options="semiRadialbarChart.chartOptions"
          ></apexchart>
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
</template>
