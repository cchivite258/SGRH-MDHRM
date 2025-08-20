<script type="ts" setup>
import { ref, watch, computed } from "vue";

import { getChartColorsArray } from "@/app/common/chartColorArray";
import { useLayoutStore } from "@/store/app";
import { getCharts } from '@/components/apexCharts/pie/utils'

const charts = ref(getCharts(getChartColorsArray));

const simplePieChart = ref(charts.value.simplePieChart)
const donutChart = ref(charts.value.donutChart)
const updatingDonutChart = ref(charts.value.updatingDonutChart)
const gradientDonutChart = ref(charts.value.gradientDonutChart)
const patternDonutChart = ref(charts.value.patternDonutChart)
const imagePieChart = ref(charts.value.imagePieChart)
const monochromePieChart = ref(charts.value.monochromePieChart)

const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);

watch(layoutTheme, () => {
  simplePieChart.value = null
  donutChart.value = null
  updatingDonutChart.value = null
  gradientDonutChart.value = null
  patternDonutChart.value = null
  imagePieChart.value = null
  monochromePieChart.value = null
  setTimeout(() => {
    const chartsVal = getCharts(getChartColorsArray);
    simplePieChart.value = chartsVal.simplePieChart
    donutChart.value = chartsVal.donutChart
    updatingDonutChart.value = chartsVal.updatingDonutChart
    gradientDonutChart.value = chartsVal.gradientDonutChart
    patternDonutChart.value = chartsVal.patternDonutChart
    imagePieChart.value = chartsVal.imagePieChart
    monochromePieChart.value = chartsVal.monochromePieChart
  }, 200);
});
</script>

<template>
  <v-row>
    <v-col cols="12" md="6">
      <Card title="Simple Pie Chart">
        <v-card-text>
          <apexchart
            v-if="simplePieChart"
            class="apex-charts"
            height="300"
            dir="ltr"
            :series="simplePieChart.series"
            :options="simplePieChart.chartOptions"
          ></apexchart>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" md="6">
      <Card title="Simple Donut Chart">
        <v-card-text>
          <apexchart
            v-if="donutChart"
            class="apex-charts"
            height="300"
            dir="ltr"
            :series="donutChart.series"
            :options="donutChart.chartOptions"
          ></apexchart>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" md="6">
      <Card title="Updating Donut Chart">
        <v-card-text>
          <apexchart
            v-if="updatingDonutChart"
            class="apex-charts"
            height="300"
            dir="ltr"
            :series="updatingDonutChart.series"
            :options="updatingDonutChart.chartOptions"
          ></apexchart>

          <div
            class="d-flex align-items-start flex-wrap gap-2 justify-content-center mt-4"
          >
            <v-btn
              id="add"
              variant="tonal"
              class="me-2"
              density="compact"
              @click="appendData"
            >
              + ADD
            </v-btn>

            <v-btn
              id="remove"
              variant="tonal"
              class="me-2"
              density="compact"
              @click="removeData"
            >
              - REMOVE
            </v-btn>

            <v-btn
              id="randomize"
              variant="tonal"
              class="me-2"
              density="compact"
              @click="randomize"
            >
              RANDOMIZE
            </v-btn>

            <v-btn
              id="reset"
              variant="tonal"
              class="me-2"
              density="compact"
              @click="reset"
            >
              RESET
            </v-btn>
          </div>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" md="6">
      <Card title="Monochrome Pie Chart">
        <v-card-text>
          <apexchart
            v-if="monochromePieChart"
            class="apex-charts"
            height="300"
            dir="ltr"
            :series="monochromePieChart.series"
            :options="monochromePieChart.chartOptions"
          ></apexchart>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" md="6">
      <Card title="Gradient Donut Chart">
        <v-card-text>
          <apexchart
            v-if="gradientDonutChart"
            class="apex-charts"
            height="300"
            dir="ltr"
            :series="gradientDonutChart.series"
            :options="gradientDonutChart.chartOptions"
          ></apexchart>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" md="6">
      <Card title="Patterned Donut Chart">
        <v-card-text>
          <apexchart
            v-if="patternDonutChart"
            class="apex-charts"
            height="300"
            dir="ltr"
            :series="patternDonutChart.series"
            :options="patternDonutChart.chartOptions"
          ></apexchart>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" md="6">
      <Card title="Pie Chart with Image Fill">
        <v-card-text>
          <apexchart
            v-if="imagePieChart"
            class="apex-charts"
            height="300"
            dir="ltr"
            :series="imagePieChart.series"
            :options="imagePieChart.chartOptions"
          ></apexchart>
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
</template>
