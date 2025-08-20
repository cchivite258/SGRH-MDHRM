<script type="ts" setup>
import { ref, watch, computed } from "vue";
import { getChartColorsArray } from "@/app/common/chartColorArray";
import { getCharts } from '@/components/apexCharts/polar/utils';
import { useLayoutStore } from "@/store/app";

const charts = ref(getCharts(getChartColorsArray));
const basicPolarareaChart = ref(charts.value.basicPolarareaChart)
const polarAreaMonochromeChart = ref(charts.value.polarAreaMonochromeChart)

const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);

watch(layoutTheme, () => {
  basicPolarareaChart.value = null;
  setTimeout(() => {
    const chartsVal = getCharts(getChartColorsArray);
    basicPolarareaChart.value = chartsVal.basicPolarareaChart;
    polarAreaMonochromeChart.value = chartsVal.polarAreaMonochromeChart;
  }, 200);
});
</script>

<template>
  <v-row>
    <v-col cols="12" md="6">
      <Card title="Basic-Polar Area Chart">
        <v-card-text>
          <apexchart
            v-if="basicPolarareaChart"
            class="apex-charts"
            height="330"
            dir="ltr"
            :series="basicPolarareaChart.series"
            :options="basicPolarareaChart.chartOptions"
          />
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" md="6">
      <Card title="Polar-Area Monochrome">
        <v-card-text>
          <apexchart
            v-if="polarAreaMonochromeChart"
            class="apex-charts"
            height="330"
            dir="ltr"
            :series="polarAreaMonochromeChart.series"
            :options="polarAreaMonochromeChart.chartOptions"
          />
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
</template>
