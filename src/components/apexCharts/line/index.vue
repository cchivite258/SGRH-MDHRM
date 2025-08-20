<script lang="ts" setup>
import { getChartColorsArray } from "@/app/common/chartColorArray";
import { ref, watch, computed } from "vue";
import { getCharts } from "@/components/apexCharts/line/utils";
import { useLayoutStore } from "@/store/app";

const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);

const charts = ref<any>(getCharts(getChartColorsArray));
const basicLineChart = ref(charts.value.basicLineChart);
const zoomableChart = ref(charts.value.zoomableChart);
const lineDatalabelChart = ref(charts.value.lineDatalabelChart);
const dashedLineChart = ref(charts.value.dashedLineChart);
const lineAnnotation = ref(charts.value.lineAnnotation);
const brushLineChart = ref(charts.value.brushLineChart);
const brushAreaChart = ref(charts.value.brushAreaChart);
const steplineChart = ref(charts.value.steplineChart);
const gradientLineChart = ref(charts.value.gradientLineChart);
const missingDataChart = ref(charts.value.missingDataChart);


watch(layoutTheme, () => {
  basicLineChart.value = null;
  zoomableChart.value = null;
  lineDatalabelChart.value = null;
  dashedLineChart.value = null;
  lineAnnotation.value = null;
  brushLineChart.value = null;
  brushAreaChart.value = null;
  steplineChart.value = null;
  gradientLineChart.value = null;
  missingDataChart.value = null;
  setTimeout(() => {
    const chartsVal = getCharts(getChartColorsArray);
    basicLineChart.value = chartsVal.basicLineChart;
    zoomableChart.value = chartsVal.zoomableChart;
    lineDatalabelChart.value = chartsVal.lineDatalabelChart;
    dashedLineChart.value = chartsVal.dashedLineChart;
    lineAnnotation.value = chartsVal.lineAnnotation;
    brushLineChart.value = chartsVal.brushLineChart;
    brushAreaChart.value = chartsVal.brushAreaChart;
    steplineChart.value = chartsVal.steplineChart;
    gradientLineChart.value = chartsVal.gradientLineChart;
    missingDataChart.value = chartsVal.missingDataChart;
  }, 200);
});
</script>
<template>
  <v-row>
    <v-col lg="6" cols="12">
      <Card title="Basic Line Chart">
        <v-card-text>
          <apexchart v-if="basicLineChart" class="apex-charts" height="350" dir="ltr" :series="basicLineChart.series"
            :options="basicLineChart.chartOptions"></apexchart>
        </v-card-text>
      </Card>
    </v-col>

    <v-col lg="6" cols="12">
      <Card title="Zoomable Timeseries">
        <v-card-text>
          <apexchart v-if="zoomableChart" class="apex-charts" height="350" dir="ltr" :series="zoomableChart.series"
            :options="zoomableChart.chartOptions"></apexchart>
        </v-card-text>
      </Card>
    </v-col>
    <v-col lg="6" cols="12">
      <Card title="with Data Labels">
        <v-card-text>
          <apexchart v-if="lineDatalabelChart" class="apex-charts" height="350" dir="ltr" :series="lineDatalabelChart.series"
            :options="lineDatalabelChart.chartOptions"></apexchart>
        </v-card-text>
      </Card>
    </v-col>

    <v-col lg="6" cols="12">
      <Card title="Dashed Line">
        <v-card-text>
          <apexchart v-if="dashedLineChart" class="apex-charts" height="350" dir="ltr" :series="dashedLineChart.series"
            :options="dashedLineChart.chartOptions"></apexchart>
        </v-card-text>
      </Card>
    </v-col>
    <v-col lg="6" cols="12">
      <Card title="Line with Annotations">
        <v-card-text>
          <apexchart v-if="lineAnnotation" class="apex-charts" height="350" dir="ltr" :series="lineAnnotation.series"
            :options="lineAnnotation.chartOptions"></apexchart>
        </v-card-text>
      </Card>
    </v-col>
    <v-col lg="6" cols="12">
      <Card title="Brush Charts">
        <v-card-text>
          <div>
            <apexchart v-if="brushLineChart" class="apex-charts" height="230" dir="ltr" :series="brushLineChart.series"
              :options="brushLineChart.chartOptions"></apexchart>

            <apexchart v-if="brushAreaChart" class="apex-charts" height="130" dir="ltr" :series="brushAreaChart.series"
              :options="brushAreaChart.chartOptions"></apexchart>
          </div>
        </v-card-text>
      </Card>
    </v-col>
    <v-col lg="6" cols="12">
      <Card title="Stepline Charts">
        <v-card-text>
          <apexchart v-if="steplineChart" class="apex-charts" height="350" dir="ltr" :series="steplineChart.series"
            :options="steplineChart.chartOptions"></apexchart>
        </v-card-text>
      </Card>
    </v-col>
    <v-col lg="6" cols="12">
      <Card title="Gradient Charts">
        <v-card-text>
          <apexchart v-if="gradientLineChart" class="apex-charts" height="350" dir="ltr" :series="gradientLineChart.series"
            :options="gradientLineChart.chartOptions"></apexchart>
        </v-card-text>
      </Card>
    </v-col>
    <v-col lg="6" cols="12">
      <Card title="Null Value Charts">
        <v-card-text>
          <apexchart v-if="missingDataChart" class="apex-charts" height="350" dir="ltr" :series="missingDataChart.series"
            :options="missingDataChart.chartOptions"></apexchart>
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
</template>
