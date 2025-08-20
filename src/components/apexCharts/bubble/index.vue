<script type="ts" setup>
import { getChartColorsArray } from "@/app/common/chartColorArray";
import { ref, watch, computed } from "vue";
import { getCharts} from "@/components/apexCharts/bubble/utils"
import { useLayoutStore } from "@/store/app";

const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);

const charts = ref(getCharts(getChartColorsArray));
const simpleBubbleChart = ref(charts.value.simpleBubbleChart);
const bubble3DChart = ref(charts.value.bubble3DChart);

watch(layoutTheme, () => {
  simpleBubbleChart.value = null;
  bubble3DChart.value = null;
  setTimeout(() => {
    const chartsVal = getCharts(getChartColorsArray);
    simpleBubbleChart.value = chartsVal.simpleBubbleChart;
    bubble3DChart.value = chartsVal.bubble3DChart;
  }, 200);
});
</script>

<template>
  <v-row>
    <v-col cols="12" lg="6">
      <Card title="Basic Bubble Chart">
        <v-card-text>
          <apexchart
            v-if="simpleBubbleChart"
            class="apex-charts"
            height="350"
            dir="ltr"
            :series="simpleBubbleChart.series"
            :options="simpleBubbleChart.chartOptions"
          ></apexchart>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="3D Bubble Chart">
        <v-card-text>
          <apexchart
            v-if="bubble3DChart"
            class="apex-charts"
            height="350"
            dir="ltr"
            :series="bubble3DChart.series"
            :options="bubble3DChart.chartOptions"
          ></apexchart>
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
</template>
