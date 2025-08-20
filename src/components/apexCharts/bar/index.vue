<script lang="ts" setup>
import { getChartColorsArray } from "@/app/common/chartColorArray";
import { getCharts } from "@/components/apexCharts/bar/utils";
import { ref, watch, computed } from "vue";
import { useLayoutStore } from "@/store/app";

const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);
// const {
//   customDatalabelsChart,
//   stackedBarChart,
//   stackedBar100Chart,
//   barNegativeChart,
//   barMarkersChart,
//   reversedBarChart,
//   patternedBarChart,
//   groupedBarChart,
const charts = ref<any>(getCharts(getChartColorsArray));
const basicBarChart = ref(charts.value.basicBarChart);
const customDatalabelsChart = ref(charts.value.customDatalabelsChart);
const stackedBarChart = ref(charts.value.stackedBarChart);
const stackedBar100Chart = ref(charts.value.stackedBar100Chart);
const barNegativeChart = ref(charts.value.barNegativeChart);
const barMarkersChart = ref(charts.value.barMarkersChart);
const reversedBarChart = ref(charts.value.reversedBarChart);
const patternedBarChart = ref(charts.value.patternedBarChart);
const groupedBarChart = ref(charts.value.groupedBarChart);


watch(layoutTheme, () => {
  basicBarChart.value = null;
  customDatalabelsChart.value = null;
  stackedBarChart.value = null;
  stackedBar100Chart.value = null;
  barNegativeChart.value = null;
  barMarkersChart.value = null;
  reversedBarChart.value = null;
  patternedBarChart.value = null;
  groupedBarChart.value = null;
  setTimeout(() => {
    const chartsVal = getCharts(getChartColorsArray);
    basicBarChart.value = chartsVal.basicBarChart;
    customDatalabelsChart.value = chartsVal.customDatalabelsChart;
    stackedBarChart.value = chartsVal.stackedBarChart;
    stackedBar100Chart.value = chartsVal.stackedBar100Chart;
    barNegativeChart.value = chartsVal.barNegativeChart;
    barMarkersChart.value = chartsVal.barMarkersChart;
    reversedBarChart.value = chartsVal.reversedBarChart;
    patternedBarChart.value = chartsVal.patternedBarChart;
    groupedBarChart.value = chartsVal.groupedBarChart;
  }, 200);
});
</script>
<template>
  <v-row>
    <v-col cols="12" lg="6">
      <Card title="Basic Bar Chart">
        <v-card-text>
          <apexchart v-if="basicBarChart" class="apex-charts" height="350" dir="ltr" :series="basicBarChart.series"
            :options="basicBarChart.chartOptions"></apexchart>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Custom DataLabels Bar">
        <v-card-text>
          <apexchart v-if="customDatalabelsChart" class="apex-charts" height="350" dir="ltr" :series="customDatalabelsChart.series"
            :options="customDatalabelsChart.chartOptions"></apexchart>
        </v-card-text>
      </Card>
    </v-col>
  </v-row>

  <v-row>
    <v-col cols="12" lg="6">
      <Card title="Stacked Bar Chart">
        <v-card-text>
          <apexchart v-if="stackedBarChart" class="apex-charts" height="350" dir="ltr" :series="stackedBarChart.series"
            :options="stackedBarChart.chartOptions"></apexchart>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Stacked Bars 100">
        <v-card-text>
          <apexchart v-if="stackedBar100Chart" class="apex-charts" height="350" dir="ltr" :series="stackedBar100Chart.series"
            :options="stackedBar100Chart.chartOptions"></apexchart>
        </v-card-text>
      </Card>
    </v-col>
  </v-row>

  <v-row>
    <v-col cols="12" lg="6">
      <Card title="Bar with Negative Values">
        <v-card-text>
          <apexchart v-if="barNegativeChart" class="apex-charts" height="350" dir="ltr" :series="barNegativeChart.series"
            :options="barNegativeChart.chartOptions"></apexchart>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Bar with Marker">
        <v-card-text>
          <apexchart v-if="barMarkersChart" class="apex-charts" height="350" dir="ltr" :series="barMarkersChart.series"
            :options="barMarkersChart.chartOptions"></apexchart>
        </v-card-text>
      </Card>
    </v-col>
  </v-row>

  <v-row>
    <v-col cols="12" lg="6">
      <Card title="Reversed Bar Chart">
        <v-card-text>
          <apexchart v-if="reversedBarChart" class="apex-charts" height="350" dir="ltr" :series="reversedBarChart.series"
            :options="reversedBarChart.chartOptions"></apexchart>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Patterned Chart">
        <v-card-text>
          <apexchart v-if="patternedBarChart" class="apex-charts" height="350" dir="ltr" :series="patternedBarChart.series"
            :options="patternedBarChart.chartOptions"></apexchart>
        </v-card-text>
      </Card>
    </v-col>
  </v-row>

  <v-row>
    <v-col cols="12" lg="6">
      <Card title="Grouped Bar Chart">
        <v-card-text>
          <apexchart v-if="groupedBarChart" class="apex-charts" height="350" dir="ltr" :series="groupedBarChart.series"
            :options="groupedBarChart.chartOptions"></apexchart>
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
</template>
